## Custom quantity field plugin for Shopware 6
Adds a custom quantity field to the product detail page in Shopware 6. This plugin is a part of the JMA Shopware 6 setup.

### To include it in a project, do the following:
- Access the project directory
- Go to the custom/plugins directory: `cd custom/plugins`
- Clone the repository: `git clone git@github.com:jmadsm/Shopware-Plugin-Custom-Quantity-Field.git`

### Assuming you are running the project in Docker container:
- Enter the container: `docker exec -it <container-name> /bin/bash`
- Install the plugin: `./bin/console plugin:install JmaCustomQuantityField --activate`
