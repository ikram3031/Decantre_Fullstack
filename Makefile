.PHONY: deploy build-bg build-fg build-dash logs status down

deploy:
	git pull origin master
	docker compose --env-file .env.dev -f docker-compose.dev.yml up -d --build --no-cache

build-bg:
	git pull origin master
	docker compose --env-file .env.dev -f docker-compose.dev.yml up -d --build --no-cache backend

build-fg:
	git pull origin master
	docker compose --env-file .env.dev -f docker-compose.dev.yml up -d --build --no-cache frontend

build-dash:
	git pull origin master
	docker compose --env-file .env.dev -f docker-compose.dev.yml up -d --build --no-cache dashboard

status:
	docker compose --env-file .env.dev -f docker-compose.dev.yml ps

logs:
	docker compose --env-file .env.dev -f docker-compose.dev.yml logs -f

down:
	docker compose --env-file .env.dev -f docker-compose.dev.yml down