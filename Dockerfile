FROM nginx:alpine
COPY . /usr/share/nginx/html
RUN rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/default.conf
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
