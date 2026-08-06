.PHONY: deploy build-bg build-fg build-dash logs status down

deploy:
	git pull origin Live
	docker compose -f docker-compose.dev.yml build --no-cache
	docker compose -f docker-compose.dev.yml up -d

build-bg:
	git pull origin Live
	docker compose -f docker-compose.dev.yml build --no-cache backend
	docker compose -f docker-compose.dev.yml up -d backend

build-fg:
	git pull origin Live
	docker compose -f docker-compose.dev.yml build --no-cache frontend
	docker compose -f docker-compose.dev.yml up -d frontend

build-dash:
	git pull origin Live
	docker compose -f docker-compose.dev.yml build --no-cache dashboard
	docker compose -f docker-compose.dev.yml up -d dashboard

status:
	docker compose -f docker-compose.dev.yml ps

logs:
	docker compose -f docker-compose.dev.yml logs -f

down:
	docker compose -f docker-compose.dev.yml down