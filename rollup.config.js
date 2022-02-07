
import commonJS from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";


export default {
    input: "src/index.js",
    output: [
        {
            format: "iife",
            file: "build.js",
            sourcemap: true,
        }
    ],
    plugins: [
        // node wouldnt be able to run the webgl stuff so we use rollup to compile it
        // nodeResolve makes sure you get the right bits of the right node modules
        nodeResolve({
            mainFields: [ "module", "jsnext:main" ],
            preferBuiltins: false,
        }),
        commonJS(), // rollup by default only uses ES6 so modlues that use earlier ES's need this to convert it to ES6. makes it backwards compatible
    ],
    onwarn: function (warning, warn) {
        if (warning.code === "CIRCULAR_DEPENDENCY") return;
        if (warning.code === "UNRESOLVED_IMPORT") {
            throw new Error(
                "Couldn't resolve the dependency " + warning.source +
					" (from " + warning.importer + "): sometimes you can" +
					" fix this with 'npm install', or add '" + warning.source +
					" to 'external'. See: " + warning.url
            );
        }
        warn(warning);
    }
};
