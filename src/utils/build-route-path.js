export function buildRoutePath(path){
    //find all params (anything starting with ':')
    const routeParamsRegex = /:([a-zA-Z]+)/g

    //on the path that we receive, replace all that matches with a regex
    const pathWithParams = path.replaceAll(routeParamsRegex, '(?<$1>[a-z0-9\-_]+)');

    //create a new regex saying that the path should begin like this new regex
    const pathRegex = new RegExp(`^${pathWithParams}(?<query>\\?(.*))?$`);
    
    return pathRegex;
}
