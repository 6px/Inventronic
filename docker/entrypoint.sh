#!/bin/sh
trap 'pkill -P $$; exit 1;' TERM INT



echo "server url $SERVER_URL"

sed -i 's|APP_BASE_URL|'$BASE_URL'|g' /app/server/chunks/nitro/node-server.mjs
sed -i 's/SUPABASE_KEY/'$SUPABASE_KEY'/g' /app/server/chunks/nitro/node-server.mjs
if [ -n "$SERVER_URL" ]; then
    if [ "$SERVER_URL" = "SERVER_URL" ]; then
        SERVER_URL=$SUPABASE_URL
    fi
    sed -i 's|SERVER_URL|'$SERVER_URL'|g' /app/server/chunks/nitro/node-server.mjs
else
    sed -i 's|SERVER_URL|'$SUPABASE_URL'|g' /app/server/chunks/nitro/node-server.mjs
fi
sed -i 's|SUPABASE_URL|'$SUPABASE_URL'|g' /app/server/chunks/nitro/node-server.mjs
exec node /app/server/index.mjs