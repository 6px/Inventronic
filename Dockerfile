FROM node:alpine

WORKDIR /app

ENV HOST 0.0.0.0

ENV SUPABASE_KEY SUPABASE_KEY
ENV SUPABASE_URL SUPABASE_URL
ENV BASE_URL APP_BASE_URL

COPY . /tmp/app/

RUN cd /tmp/app && npm install \
  && npm run build \
  && rm -rf node_modules \
  && mv /tmp/app/.output/* /app/ \
  && rm -rf /tmp/app

EXPOSE 3000

CMD [ "sh", "-c", "sed -i 's|APP_BASE_URL|'$BASE_URL'|g' server/chunks/nitro/node-server.mjs && sed -i 's/SUPABASE_KEY/'$SUPABASE_KEY'/g' server/chunks/nitro/node-server.mjs && sed -i 's|SUPABASE_URL|'$SUPABASE_URL'|g' server/chunks/nitro/node-server.mjs && node server/index.mjs" ]