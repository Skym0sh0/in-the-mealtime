import org.flywaydb.core.Flyway
import org.flywaydb.core.api.Location
import org.jooq.codegen.GenerationTool
import org.jooq.meta.jaxb.*
import org.jooq.meta.jaxb.Configuration
import org.jooq.meta.jaxb.Target
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.utility.DockerImageName

buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath("org.postgresql:postgresql:42.7.3")
        classpath("org.testcontainers:postgresql:1.19.8")
        classpath("org.jooq:jooq-codegen:3.19.10")
        classpath("org.flywaydb:flyway-core:10.10.0")
        classpath("org.flywaydb:flyway-database-postgresql:10.10.0")
    }
}

plugins {
    java
    id("org.springframework.boot") version "3.3.1"
    id("io.spring.dependency-management") version "1.1.5"
    id("org.openapi.generator") version "7.7.0"
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(22)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-jersey")
    implementation("org.springframework.boot:spring-boot-starter-jooq")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    implementation("org.springframework.session:spring-session-core")

    implementation("io.swagger.core.v3:swagger-models:2.2.22")
    implementation("io.swagger.core.v3:swagger-annotations:2.2.22")

    implementation("org.apache.commons:commons-lang3:3.14.0")
    implementation("com.google.guava:guava:33.2.1-jre")

    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    testCompileOnly("org.projectlombok:lombok")
    testAnnotationProcessor("org.projectlombok:lombok")

    developmentOnly("org.springframework.boot:spring-boot-devtools")

    runtimeOnly("org.postgresql:postgresql")

    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:postgresql")

    runtimeOnly("com.h2database:h2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.register<Copy>("copyWebApp") {
    dependsOn(":frontend:build")

    from("$rootDir/frontend/build/dist")
    into(layout.buildDirectory.dir("resources/main/static/"))
}

tasks.named("processResources") {
    dependsOn("copyWebApp")
}

tasks.register("jooqCodegen") {
    group = "build"

    inputs.files(layout.projectDirectory.dir("/src/main/resources/db/migration"))
    outputs.dir(file(layout.buildDirectory.dir("generated/sources/jooq")))

    doLast {
        PostgreSQLContainer<Nothing>(
            DockerImageName.parse("postgres")
                .withTag("16.1@sha256:ee5dc0b649c9322656a1ee2c5dce7ce17fa9b15d838e992ca43a8e0b108b098e")
        ).use {
            it.start()

            Flyway.configure()
                .dataSource(it.jdbcUrl, it.username, it.password)
                .locations("${Location.FILESYSTEM_PREFIX}${layout.projectDirectory.dir("/src/main/resources/db/migration").asFile.path}")
                .load()
                .migrate()

            Configuration()
                .withJdbc(
                    Jdbc()
                        .withDriver("org.postgresql.Driver")
                        .withUrl(it.jdbcUrl)
                        .withUser(it.username)
                        .withPassword(it.password)
                )
                .withGenerator(
                    Generator()
                        .withDatabase(
                            Database()
                                .withInputSchema("public")
                                .withOutputSchema("meal_ordering")
                                .withExcludes(".*flyway.*")
                                .withForcedTypes(
                                    ForcedType()
                                        .withName("NUMERIC")
                                        .withIncludeTypes("MONEY")
                                )
                        )
                        .withGenerate(
                            Generate()
                                .withFluentSetters(true)
                                .withDeprecated(false)
                                .withRelations(true)
                        )
                        .withTarget(
                            Target()
                                .withPackageName("generated.sky.meal.ordering.schema")
                                .withDirectory(layout.buildDirectory.dir("generated/sources/jooq").get().asFile.path)
                                .withEncoding("UTF-8")
                                .withClean(true)
                        )
                ).also(GenerationTool::generate)
        }
    }
}

tasks.named("compileJava") {
    dependsOn("jooqCodegen")
}

openApiGenerate {
    generatorName.set("spring")
    inputSpec.set(layout.projectDirectory.dir("..").dir("spec").file("openapi-spec.yml").asFile.path)
    outputDir.set(layout.buildDirectory.dir("generated/sources/spec").get().asFile.path)
    apiPackage.set("generated.sky.meal.ordering.rest.api")
    modelPackage.set("generated.sky.meal.ordering.rest.model")
    configOptions.set(
        mapOf(
            "library" to "spring-boot",
            "dateLibrary" to "java8",
            "useJakartaEe" to "true",
            "generateBuilders" to "true",
            "legacyDiscriminatorBehavior" to "false",
            "openApiNullable" to "false",
            "delegatePattern" to "false",
            "useSpringBoot3" to "true",
            "interfaceOnly" to "true",
            "skipDefaultInterface" to "true",
            "returnSuccessCode" to "true",
        )
    )
}

tasks.named("compileJava") {
    dependsOn(tasks.openApiGenerate)
}

sourceSets {
    main {
        java.srcDirs(layout.buildDirectory.dir("generated/sources/jooq/generated").get().asFile)
        java.srcDirs(layout.buildDirectory.dir("generated/sources/spec/src/main").get().asFile)
    }
}
