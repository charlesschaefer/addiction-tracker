import { config } from 'dotenv';
import * as fs from 'fs';
import * as colors from 'colors';

function configEnv() {
    config({
        path: 'src/environments/.env'
    });

    const targetProdPath = './src/environments/environment.ts';
    let envFile = `{
        "googleProjectName": "${process.env['GOOGLE_GEMINI_PROJECT_NAME']}",
        "googleApiKey": "${process.env['GOOGLE_GEMINI_API']}"
    }`;

    envFile = 'export const environment = ' + JSON.stringify(JSON.parse(envFile), null, '    ');

    fs.writeFile(targetProdPath, envFile, (err: Error) => {
        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log(colors.green(`Environment file generated correctly at ${targetProdPath}!`));
        }
    });
}

configEnv();