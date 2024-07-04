import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("base")
    id("com.github.node-gradle.node") version "7.0.2"
}

node {
    download = false
    version = "22.3.0"
    npmVersion = "10.8.1"
}

tasks.register<Delete>("cleanNodeModules") {
    delete("node_modules")
    delete(".gradle")
}
tasks.named("clean") {
    dependsOn("cleanNodeModules")
}

tasks.register<NpmTask>("npmBuild") {
    dependsOn("npmInstall")

    inputs.file(file("${projectDir}/package.json"))
    inputs.file(file("${projectDir}/package-lock.json"))
    inputs.dir(file("${projectDir}/src/"))
    inputs.files(fileTree("${projectDir}/node_modules") {
        exclude(".cache")
        exclude(".bin")
    })

    outputs.dir(file("${projectDir}/build/dist"))

    args.set(listOf("run", "build"))
}
tasks.named("assemble") {
    dependsOn("npmBuild")
}

tasks.register<NpmTask>("npmStartGUI") {
    dependsOn("npmInstall")

    args.set(listOf("run", "dev"))
}
