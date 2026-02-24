.PHONY: build run clean restore test watch migrate

build:
	dotnet build TaskHub.slnx

run:
	dotnet run --project src/TaskHub.Api/TaskHub.Api.csproj
run-file:
	dotnet run --project src/TaskHub.Api -- --StorageProvider=File

clean:
	dotnet clean
	rm -rf src/**/bin src/**/obj

restore:
	dotnet restore TaskHub.slnx

test:
	dotnet test TaskHub.slnx

watch:
	dotnet watch run --project src/TaskHub.Api/TaskHub.Api.csproj

migrate:
	dotnet ef database update --project src/TaskHub.Infrastructure --startup-project src/TaskHub.Api