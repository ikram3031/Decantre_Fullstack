.PHONY: deploy build-bg build-fg build-dash logs status down

deploy:
	git pull origin master
	docker compose -f docker-compose.dev.yml --env-file .env.dev build --no-cache
	docker compose -f docker-compose.dev.yml --env-file .env.dev up -d

build-bg:
	docker compose -f docker-compose.dev.yml --env-file .env.dev up -d --build backend

build-fg:
	docker compose -f docker-compose.dev.yml --env-file .env.dev up -d --build frontend

build-dash:
	docker compose -f docker-compose.dev.yml --env-file .env.dev up -d --build dashboard

logs:
	docker compose -f docker-compose.dev.yml --env-file .env.dev logs -f

status:
	docker compose -f docker-compose.dev.yml --env-file .env.dev ps

down:
	docker compose -f docker-compose.dev.yml --env-file .env.dev down
