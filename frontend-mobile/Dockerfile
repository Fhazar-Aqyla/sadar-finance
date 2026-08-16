# Stage 1: Build React/Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ENV VITE_API_URL=/api/v1
ENV VITE_DEFAULTAUTH=sadar
ENV VITE_SADAR_DATA_SCENARIO=backend-only
RUN npm run build

# Stage 2: Serve menggunakan Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy file config Nginx khusus (agar routing React tidak 404 pas di-refresh)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
