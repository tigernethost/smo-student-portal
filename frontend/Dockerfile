FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY frontend/package.json ./
RUN npm install

COPY frontend/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["npm", "start"]
