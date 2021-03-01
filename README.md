# link_sentry: Storefront Reference Architecture (SFRA)

This is the repository for the link_sentry plugin. This plugin adds Sentry Monitoring, including
the following capabilities:

* Client Side error reporting
* Server Side error reporting
* Optional library functions to log custom errors to sentry

# Cartridge Path Considerations

The link_sentry plugin requires the app\_storefront\_base cartridge. In your cartridge path, include the cartridges in
the following order:

```
plugin_sentry:lib_sentry:app_storefront_base
```

# Getting Started

1. Clone this repository. (The name of the top-level folder is link_sentry.)
2. In the top-level plugin_gtm folder, enter the following command: `npm install`. (This command installs all of the
   package dependencies required for this plugin.)
3. In the top-level link_sentry folder, edit the paths.base property in the package.json file. This property should
   contain a relative path to the local directory containing the Storefront Reference Architecture repository. For
   example:

```
"paths": {
    "base": "../storefront-reference-architecture/cartridges/app_storefront_base/"
}
```

4. In the top-level link_sentry folder, enter the following command: `npm run compile:js`
5. In the top-level link_sentry folder, enter the following command: `npm run uploadCartridge`

For information on Getting Started with SFRA,
see [Get Started with SFRA](https://documentation.b2c.commercecloud.salesforce.com/DOC1/index.jsp?topic=%2Fcom.demandware.dochelp%2Fcontent%2Fb2c_commerce%2Ftopics%2Fsfra%2Fb2c_sfra_setup.html)
.

#Metadata

## Services
To contact Sentry it is required to configure a service (without credentials). A file containing the required 
configuration can be imported in the business manager. The file is located here `metadata/services.xml`.

## Site Preferences
A few preferences are added to the `Site Preferences` system object. The file `metadata/site-preferences.xml` can be 
imported as a System Object Type in the business manager.

#Usage

## Initialization

## Hooks

### com.sentry.beforesend
Use this hook to prevent certain events from being sent to Sentry, or to make modifications to it.
```
Hook:       com.sentry.beforesend
Function:   beforeSend
Parameters: SentryEvent object

Example:

function beforeSend(sentryEvent) {
   // your logic, if this function returns null, the event is not sent.
   
   return sentryEvent;
}

module.exports = {
   beforeSend: beforeSend
};
```

Never used hooks before? Look at the documentation [here](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/content/b2c_commerce/topics/sfra/b2c_sfra_hooks.html?resultof=%22%68%6f%6f%6b%73%22%20%22%68%6f%6f%6b%22%20).

# Release management

# NPM scripts

Use the provided NPM scripts to compile and upload changes to your sandbox.

## Compiling your application

* `npm run compile:js` - Compiles all js files and aggregates them.

**Note:** The plugin cartridge must be compiled after compiling storefront-reference-architecture (SFRA base) cartridge.

## Linting your code

`npm run lint` - Execute linting for all JavaScript and SCSS files in the project.

## Watching for changes and uploading

`npm run watch` - Watches everything and recompiles (if necessary) and uploads to the sandbox. Requires a valid dw.json
file at the root that is configured for the sandbox to upload.
