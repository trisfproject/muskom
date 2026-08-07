FROM nginx:alpine

ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_FILTER=MAX_UPLOAD_SIZE
ENV MAX_UPLOAD_SIZE=10485760

COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY nginx.conf /etc/nginx/nginx.conf
