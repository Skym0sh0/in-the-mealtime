plugins {
}

allprojects {
    group = "de.sky.meal.ordering"
    version = System.getenv("RELEASE_VERSION") ?: "latest"

    repositories {
        mavenCentral()
    }
}
