FROM tomcat:8-jre8-alpine

# Set Catalina/Tomcat Home
ENV TOMCAT_HOME="/usr/local/tomcat"

# APK upgrade, add curl
RUN apk upgrade --update && apk add --update curl

# Java memory settings
ADD jvmMemSettings.sh /jvmMemSettings.sh
ENTRYPOINT ["/jvmMemSettings.sh"]

# Add a tomcat users config for admin access, if desired
COPY tomcat-users.xml ${TOMCAT_HOME}/conf/tomcat-users.xml

WORKDIR /tmp

#Copy SMK api
RUN wget -O /tmp/smks-api.war $APPBIN/smks-api/$SMKVER/smks-api-$SMKVER.war \
  && mkdir -p ${TOMCAT_HOME}/webapps/smks-api \
  && unzip /tmp/smks-api.war -d ${TOMCAT_HOME}/webapps/smks-api

#Copy client war
RUN wget -O /tmp/smk-client.war $APPBIN/smk-client/$SMKVER/smk-client-$SMKVER.war \
  && cp /tmp/smk-client.war ${TOMCAT_HOME}/webapps \
  && cp /tmp/smk-client.war ${TOMCAT_HOME}/webapps/smks-api/WEB-INF/classes/

#Copy SMK Admin UI
RUN wget -O /tmp/smk-ui.war $APPBIN/smk-ui/$SMKVER/smk-ui-$SMKVER.war \
  && cp /tmp/smk-ui.war ${TOMCAT_HOME}/webapps

RUN echo "couchdb.admin.password=password" >> ${TOMCAT_HOME}/webapps/smks-api/WEB-INF/classes/application.properties

# add a tomcat user
RUN adduser -S tomcat
RUN chown -R tomcat:0 `readlink -f ${TOMCAT_HOME}` &&\
  chmod -R 770 `readlink -f ${TOMCAT_HOME}` &&\
  chown -h tomcat:0 ${TOMCAT_HOME}

USER tomcat

EXPOSE 8080

CMD catalina.sh run