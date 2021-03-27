FROM node:14-alpine
LABEL name="Schoolmaster"
LABEL version="0.1.0"

WORKDIR /usr/schoolmaster
COPY package.json pnpm-lock.yaml ./

RUN apk add --update \
	&& apk add --no-cache ca-certificates \
	&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
	# For node-canvas
	&& apk add --no-cache cairo-dev jpeg-dev pango pango-dev giflib-dev bash imagemagick \
	# For canvas-prebuilt
	pixman libc6-compat \
	# Default fonts for Canvas
	fontconfig ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-opensans ttf-ubuntu-font-family \
	dumb-init \
	&& curl -L https://unpkg.com/@pnpm/self-installer | node \
	&& apk del .build-deps

COPY . .

RUN pnpm i --frozen-lockfile && pnpm prune --prod
CMD ["dumb-init", "node", "src/bot.js"]