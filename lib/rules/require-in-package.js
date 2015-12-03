var findup = require('findup-sync');
var fs = require('fs');
var path = require('path');
var isBuiltInModule = require('is-builtin-module');

module.exports = function(context) {

  // Read configuration.
  var config = context.options[0];
      onlyProd = config === 'production';

	return {
		"CallExpression": function (node) {
      if (node.callee.name !== "require")
        return;

			var requirePath = node.arguments
        && node.arguments.length > 0
        && node.arguments[0].value;

      if (!requirePath)
        return;

			// Don't worry about relative paths or built ins
			if (isRelativePath(requirePath) || isBuiltInModule(requirePath))
				return;

			var pkg = getLocalPackageJson(context.getFilename());
			if (pkg) {
				var dependencies = getDependencyList(pkg, onlyProd);
				var dependencyToValidate = getDepNameFromRequirePath(requirePath);
				if (dependencies.indexOf(dependencyToValidate) === -1) {
					context.report(node, 'Dependency not in the local package.json', {
						dependency: requirePath
					});
				}
			}
		}
	};
};

function isRelativePath(requirePath) {
	return requirePath.indexOf('.') == 0;
}

function getLocalPackageJson(filename) {
	//TODO: cache this?
	var basedir = path.dirname(filename);
	var packagePath = findup('package.json', {cwd: basedir});
	return packagePath
		? JSON.parse(fs.readFileSync(packagePath))
		: null;
}

function getDependencyList(pkg, onlyProd) {
	var dependencies = [];
	if (pkg.dependencies) {
		dependencies = dependencies.concat(Object.keys(pkg.dependencies));
	}
	if (pkg.peerDependencies) {
		dependencies = dependencies.concat(Object.keys(pkg.peerDependencies));
	}
	if (pkg.devDependencies && !onlyProd) {
		dependencies = dependencies.concat(Object.keys(pkg.devDependencies));
	}
	return dependencies;
}

function getDepNameFromRequirePath(requirePath) {
	if (requirePath.indexOf('/') === -1) {
		return requirePath;
	} else {
		if (isScopedModule(requirePath)) {
			var secondSlashIndex = requirePath.indexOf('/', requirePath.indexOf('/')+1);
			if (secondSlashIndex == -1) {
				return requirePath;
			} else {
				return requirePath.substr(0, secondSlashIndex);
			}
		} else {
			return requirePath.substr(0, requirePath.indexOf('/'));
		}
	}
}

function isScopedModule(requirePath) {
	return requirePath.indexOf('@') === 0;
}
