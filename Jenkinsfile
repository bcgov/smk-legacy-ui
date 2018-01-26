node ('master'){
    def server = Artifactory.server 'prod'
    def rtMaven = Artifactory.newMavenBuild()
    def buildInfo

    stage ('SCM prepare'){
        deleteDir()
//        git branch: '${gitTag}', url: 'https://github.com/bcgov/smk.git'
        checkout([$class: 'GitSCM', branches: [[name: '${gitTag}']], doGenerateSubmoduleConfigurations: false, extensions: [], gitTool: 'Default', submoduleCfg: [], userRemoteConfigs: [[url: 'https://github.com/bcgov/smk.git']]])
        withMaven(jdk: 'JDK8', maven: 'm3') {
            sh 'mvn versions:set -DnewVersion="${mvnTag}"'
        }
    }
    
    stage ('Sonar'){
        withSonarQubeEnv('appqa') {
        withMaven(jdk: 'JDK8', maven: 'm3') {
            sh 'mvn clean package org.sonarsource.scanner.maven:sonar-maven-plugin:3.2:sonar'
            }
        }
    }
 
    stage ('Artifactory configuration'){
        rtMaven.tool = 'm3' // Tool name from Jenkins configuration
        rtMaven.deployer releaseRepo: 'libs-release-local', snapshotRepo: 'libs-snapshot-local', server: server
        rtMaven.resolver releaseRepo: 'repo', snapshotRepo: 'repo', server: server
        rtMaven.deployer.deployArtifacts = false // Disable artifacts deployment during Maven run
        buildInfo = Artifactory.newBuildInfo()
    }

    stage ('Maven Install'){
        rtMaven.run pom: 'pom.xml', goals: 'clean install', buildInfo: buildInfo
    }
    
    stage ('Artifactory Deploy'){
        rtMaven.deployer.deployArtifacts buildInfo
    }
    
    stage ('Artifactory Publish build info'){
        server.publishBuildInfo buildInfo
    }

    stage ('OpenShift Build'){
    openshiftBuild apiURL: 'https://console.pathfinder.gov.bc.ca', authToken: '${OCP_TOKEN}', bldCfg: 'smk-deployment', buildName: '', checkForTriggeredDeployments: 'true', commitID: '', env: [[name: 'APPBIN', value: 'http://delivery.apps.bcgov/artifactory/libs-snapshot-local/ca/bc/gov/databc'], [name: 'KAURL', value: '${KongAdminURL}'], [name: 'KUSER', value: '${KongAdminUID}'], [name: 'KPWD', value: '${KongAdminPWD}'], [name: 'GWA_ORG', value: '${GIT_OAUTH_ORG}'], [name: 'GH_CID', value: '${GIT_OAUTH_CLIENTID}'], [name: 'GH_CIS', value: '${GIT_OAUTH_CLIENTSECRET}'], [name: 'GH_ATOKEN', value: '${GIT_ADMIN_TOKEN}']], namespace: 'dbc-mapsdk-tools', showBuildLogs: 'true', verbose: 'true', waitTime: '', waitUnit: 'sec'
    }

    stage ('OpenShift Image Release'){
    openshiftTag alias: 'false', apiURL: 'https://console.pathfinder.gov.bc.ca', authToken: '${OCP_TOKEN}', destStream: 'smk', destTag: '${OCP_IMENV}', destinationAuthToken: '${OCP_TOKEN}', destinationNamespace: 'dbc-mapsdk-tools', namespace: 'dbc-mapsdk-tools', srcStream: 'smk-deployment', srcTag: 'latest', verbose: 'true'
    }
}