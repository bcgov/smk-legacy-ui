function deploy() {
    local PRJ=$1
    echo $PRJ
    echo deploying $PRJ
    curl -X PUT -u ben:secret --upload-file smk-parent/$PRJ/target/$PRJ.war "http://localhost:8080/manager/text/deploy?path=/$PRJ&update=true"
}

deploy 'smk-ui'
deploy 'smks-api'
deploy 'smk-client'
# SMK_UI=smk-parent/smk-ui/target/smk-ui.war
# echo deploying $SMK_UI
# curl -X PUT -u ben:secret --upload-file $SMK_UI 'http://localhost:8080/manager/text/deploy?path=/smk-ui&update=true'