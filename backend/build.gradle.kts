import org.flywaydb.core.Flyway
import org.flywaydb.core.api.Location
import org.jooq.codegen.GenerationTool
import org.jooq.meta.jaxb.*
import org.jooq.meta.jaxb.Configuration
import org.jooq.meta.jaxb.Target
import org.testcontainers.containers.PostgreSQLContainer

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

    compileOnly("org.projectlombok:lombok")

    developmentOnly("org.springframework.boot:spring-boot-devtools")

    runtimeOnly("org.postgresql:postgresql")

    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")
    annotationProcessor("org.projectlombok:lombok")

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

tasks.named("assemble") {
    dependsOn("copyWebApp")
}

tasks.register("jooqCodegen") {
    group = "build"

    inputs.files(layout.projectDirectory.dir("/src/main/resources/db/migration"))
    outputs.dir(file(layout.buildDirectory.dir("generated/sources/jooq")))

    doLast {
        PostgreSQLContainer<Nothing>("postgres:16.1").use {
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

sourceSets {
    main {
        java.srcDirs(layout.buildDirectory.dir("generated/sources/jooq").get().asFile)
    }
}

tasks.named("compileJava") {
    dependsOn("jooqCodegen")
}
