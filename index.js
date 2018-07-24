let fs = require('fs')
let path = require('path')
let bodyParser = require('body-parser');

module.exports = function (options) {
    if (!options) return console.log('aye-pee-eye requires options')
    let { express, app, root } = options
    if (!express || !app || !root) console.log('aye-pee-eye requires express, app, and root. See examples')


    let api_file_names_with_extensions = retrieve_api_file_names()
    api_file_names_with_extensions = swith_backslashes_to_forward_for_all_filenames(api_file_names_with_extensions)
    let api_file_names = remove_extensions_from_filenames(api_file_names_with_extensions)
    mount_api_endpoints(api_file_names, root, express, app)
    mount_getMethods_endpoint(api_file_names, root, express, app)
}




let retrieve_api_file_names = () => {
    // recursive function to map files from directory. Truthfully I don't get it. straight copy pasta - it's 230am give ma break
    const walkSync = (d) => fs.statSync(d).isDirectory() ? fs.readdirSync(d).map(f => walkSync(path.join(d, f))) : d
    let filesNested = walkSync('./api')
    let files = []
    let pushFromArray = (arr) => {
        if (arr.forEach) arr.forEach(el => pushFromArray(el))
        else files.push(arr)
    }
    pushFromArray(filesNested)
    files = files.map(file => remove_api_prefix(file))
    return files
}


let swith_backslashes_to_forward_for_all_filenames = file_names => file_names.map(file_name => swith_backslashes_to_forward_for_one(file_name))
let swith_backslashes_to_forward_for_one = file_name => file_name.split('\\').join('/')
let remove_api_prefix = api_endpoint => api_endpoint.slice(3, api_endpoint.length)
let remove_extensions_from_filenames = file_names => file_names.map(file_name => remove_extension_from_filename(file_name))
let remove_extension_from_filename = file_name => file_name.split('.')[0]


let mount_api_endpoints = (api_file_names, root, express, app) => {
    api_file_names.forEach(api_file => {
        var router = express.Router();
        router.use(bodyParser.json())
        let { api, middleware } = require(root + '/api' + api_file)
        middleware ? router.post('/', middleware, api) : router.post('/', api)
        app.use(api_file, router)
    })
}
let mount_getMethods_endpoint = (api_file_names, root, express, app) => {
    var router = express.Router();
    router.use(bodyParser.json())
    router.post('/', function (req, res) {
        res.json(api_file_names)
    })
    app.use('/_getMethods_', router)
}