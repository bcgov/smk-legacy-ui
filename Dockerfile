FROM davidcaste/alpine-tomcat:tomcat8

ENV CATALINA_HOME="/opt/tomcat"

# adjust config in tomcat
ADD docker/tomcat/conf/* ${CATALINA_HOME}/conf

# ensure cUrl is available
RUN apk upgrade --update &&\
  apk add --update curl

WORKDIR /tmp

# install smk-client war
RUN wget -O /tmp/smk-client.war $APPBIN/smk-client/$SMKVER/smk-client-$SMKVER.war &&\
  cp /tmp/smk-client.war ${CATALINA_HOME}/webapps

# install smk-ui war
RUN wget -O /tmp/smk-ui.war $APPBIN/smk-ui/$SMKVER/smk-ui-$SMKVER.war &&\
  cp /tmp/smk-ui.war ${CATALINA_HOME}/webapps

# install smks-api war
RUN wget -O /tmp/smks-api.war $APPBIN/smks-api/$SMKVER/smks-api-$SMKVER.war &&\
  mkdir -p ${CATALINA_HOME}/webapps/smks-api &&\
  unzip /tmp/smks-api.war -d ${CATALINA_HOME}/webapps/smks-api

# install couchdb password
RUN echo "couchdb.admin.password=$COUCHPW" >> ${CATALINA_HOME}/webapps/smks-api/WEB-INF/classes/application.properties

# add a tomcat user
RUN adduser -S tomcat
RUN chown -R tomcat:0 `readlink -f ${CATALINA_HOME}` &&\
  chmod -R 770 `readlink -f ${CATALINA_HOME}` &&\
  chown -h tomcat:0 ${CATALINA_HOME}

# run as tomcat user
USER tomcat

EXPOSE 8080
WORKDIR ${CATALINA_HOME}/bin

CMD ./catalina.sh run
