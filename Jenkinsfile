node ('master'){
    def server = Artifactory.server 'prod'
    def rtMaven = Artifactory.newMavenBuild()
    def buildInfo

//     stage ('SCM prepare'){
//         deleteDir()
// //        git branch: '${gitTag}', url: 'https://github.com/bcgov/smk.git'
//         // checkout([$class: 'GitSCM', branches: [[name: '${gitTag}']], doGenerateSubmoduleConfigurations: false, extensions: [], gitTool: 'Default', submoduleCfg: [], userRemoteConfigs: [[url: 'https://github.com/bcgov/smk.git']]])
//     }

    stage ('OpenShift Build'){
    openshiftBuild apiURL: 'https://console.pathfinder.gov.bc.ca', authToken: '${OCP_TOKEN}', bldCfg: 'smk', buildName: '', checkForTriggeredDeployments: 'true', commitID: '', env: [
            [name: 'APPBIN', value: 'http://delivery.apps.bcgov/artifactory/libs-release-local/ca/bc/gov/databc'],
            [name: 'COUCHPW', value: '${COUCHPW}'],
            [name: 'SMKVER', value: '${SMKVER}'],
        ], namespace: 'dbc-mapsdk-tools', showBuildLogs: 'true', verbose: 'true', waitTime: '', waitUnit: 'sec'
    }

    stage ('OpenShift Image Release'){
    openshiftTag alias: 'false', apiURL: 'https://console.pathfinder.gov.bc.ca', authToken: '${OCP_TOKEN}', destStream: 'smk', destTag: '${OCP_IMENV}', destinationAuthToken: '${OCP_TOKEN}', destinationNamespace: 'dbc-mapsdk-tools', namespace: 'dbc-mapsdk-tools', srcStream: 'smk', srcTag: 'latest', verbose: 'true'
    }
}