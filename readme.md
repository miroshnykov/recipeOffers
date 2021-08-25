> create recipe and send to s3 folder co-recipe
## Docker setup
	docker build -t recipeOffers .
   	docker run -it -p 3001:3001 --rm --name recipeOffers-  recipeOffers
## run 
    npm run dev
## build
    npm run build
## env example
    HOST=localhost
    PORT=3001
    ENV=development
    DB_HOST=127.0.0.1
    DB_PORT=3007
    DB_USERNAME=
    DB_PASSWORD=
    DB_NAME=traffic
    
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_REGION=us-east-1
    
    OFFERS_RECIPE_PATH=/tmp/co-recipe/offersRecipe.json
    CAMPAIGNS_RECIPE_PATH=/tmp/co-recipe/campaignsRecipe.json
    
    S3_CAMPAIGNS_RECIPE_PATH=campaignsRecipe.json.gz
    S3_OFFERS_RECIPE_PATH=offersRecipe.json.gz
    S3_BUCKET_NAME=co-recipe-staging
