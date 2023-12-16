FROM node:lts-alpine

WORKDIR /app

ENV HOST 0.0.0.0

ENV SUPABASE_KEY SUPABASE_KEY
ENV SUPABASE_URL SUPABASE_URL
ENV SERVER_URL SERVER_URL
ENV BASE_URL APP_BASE_URL

COPY . /tmp/app/

RUN cd /tmp/app && npm install \
  && npm run build \
  && rm -rf node_modules \
  && mv /tmp/app/.output/* /app/ \
  && rm -rf /tmp/app

COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod 755 /entrypoint.sh

EXPOSE 3000

CMD [ "/entrypoint.sh" ]
