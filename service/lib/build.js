/*const fs = require('fs');
const path = require('path');
const crypto = require("crypto");*/
import crypto from "crypto";
import { cp, mkdir, rename, readFile, writeFile, rm } from "fs/promises";
import { join } from 'node:path';
import { exec } from "child_process";
import { promisify } from "util";
import { createReadStream } from "fs";

const execAsync = promisify(exec);

class build{
	constructor(){}

	async init(pages){
		const self = this;

		// create session id 
		const uuid = crypto.randomUUID();

		// make tmp dir 
		const rootPath = join(__basedir, '..');
		const sessionPath = join(rootPath, 'tmp', uuid);
		await mkdir(sessionPath, { recursive: true });

		const needToCopy = [
			'public',
			'src/css',
			'src/helper',
			'src/models',
			'src/main.css',
			'src/main.js',
			'.gitignore',
			'.htaccess',
			'index.html',
			'package.json',
			'node_modules',
			'start',
			'build',
			'utils',
		]

		for(const item of needToCopy){
			await cp(join(rootPath, item), join(sessionPath, item), { recursive: true, force: true });
		}

		// copy everything inside template to tmp dir 
		await cp(join(rootPath, 'template', 'build', 'src'), join(sessionPath, 'src'), { recursive: true, force: true });


		// listing page 
		for(const page in pages){

			const pageTitle = self.capitalizeFirstLetter(page);
			const pageContent = pages[page];

			// create page and rename the name 
			await cp(join(sessionPath, 'src', 'pages', 'PageTemplate'), join(sessionPath, 'src', 'pages', `Page${pageTitle}`), { recursive: true, force: true });

			const filePath = join(sessionPath, 'src', 'pages', `Page${pageTitle}`, `Page${pageTitle}.js`);

			await rename(
				join(sessionPath, 'src', 'pages', `Page${pageTitle}`, 'PageTemplate.js'),
				filePath,
			);

    		let content = await readFile(filePath, "utf8");
    		content = content.replace(/PageTemplate/g, `Page${pageTitle}`);
			content = content.replace(/page-template/g, 'page-' + self.toKebabCase(pageTitle));

			// replace /* components array */  in each page 
			content = content.replace(/\/\* components array \*\//g, JSON.stringify(pageContent, null, 2));
			
			await writeFile(filePath, content, "utf8");
		}

		// delete PageTemplate 
		await rm(
			join(sessionPath, 'src', 'pages', 'PageTemplate'), 
			{ recursive: true, force: true }
		);

		// run build 
		const { stdout, stderr } = await execAsync("node build", {
      		cwd: sessionPath,
    	});

		// compress dist
		await execAsync(`zip -r ${uuid}.zip dist`, {
      		cwd: sessionPath,
    	});

		// sent it to user 
		const buffer = createReadStream(join(sessionPath, `${uuid}.zip`));

		// remove tmp dir
		await rm(
			join(sessionPath), 
			{ recursive: true, force: true }
		);

		return {
			filename: `${uuid}.zip`,
			buffer
		};

	}

	capitalizeFirstLetter(string) {
  		if (string.length === 0) {
    		return ""; // Handle empty strings
  		}
  		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	toKebabCase(str) {
  		return str
    		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')     // aaaB => aaa-B
    		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')   // JSONData => JSON-Data
    		.replace(/([a-zA-Z])([0-9])/g, '$1-$2')      // Page404 => Page-404
    		.replace(/([0-9])([a-zA-Z])/g, '$1-$2')      // 404Page => 404-Page (rare case)
    		.toLowerCase();
	}

	async replaceMainCSS(filepath, newTexts){
		const self = this;

		// delete current import text
		const deleteResult = await self.deleteLine(filepath, '/* css components */', '/* end of css components */');
		if(!deleteResult.status){
			console.log(deleteResult.error);
			return deleteResult;
		}
		
		// add new import text
		const wrappedText = await self.addIndent(newTexts, deleteResult.data.indent);
		const addResult = await self.addLine(filepath, wrappedText, deleteResult.data.firstLine);
		if(!addResult.status){
			console.log(addResult.error);
			return addResult;
		}

		return { status: true };
	}

	async generateImportCSS(files){
		// example :
		//@import url('./components/MonitoringPage/monitoringPage.component.css');
		
		let texts = '/* css components */\n';
		for(let file of files){
			texts += `@import url('${file}');\n`
		}
		texts += '/* end of css components */\n';

		return texts;
	}

	async replaceMainJS(filepath, newTexts){
		const self = this;

		// delete current import text
		const deleteResult = await self.deleteLine(filepath, '/* js components */', '/* end of js components */');
		if(!deleteResult.status){
			console.log(deleteResult.error);
			return deleteResult;
		}
		
		// add new import text
		const wrappedText = await self.addIndent(newTexts, deleteResult.data.indent);
		const addResult = await self.addLine(filepath, wrappedText, deleteResult.data.firstLine);
		if(!addResult.status){
			console.log(addResult.error);
			return addResult;
		}

		return { status: true };
	}

	async generateImportJS(files){
		// example :
		//import './components/MonitoringPage/monitoringPage.component.js';
		
		let texts = '/* js components */\n';
		for(let file of files){
			texts += `import '${file}';\n`
		}
		texts += '/* end of js components */\n';


		return texts;
	}

	async deleteLine(fileName, firstKeyword, lastKeyword){
		return new Promise((resolve) => {
			fs.readFile(fileName, 'utf8', (err, data) => {

				const lines = data.split('\n');
				let newTexts = data;
				let currentLine = 0;
				let firstFoundLine = 0;
				let indent = '';

				let step = 0; // 1 = firstKeyword found, 2 = lastKeyword found

				for(let line of lines){

					currentLine++;

					if(line.includes(firstKeyword)){
						const indentMatch = line.match(/^(.*?)\/\*/);
						if(indentMatch?.length > 1){
							indent = indentMatch[1];
						}

						firstFoundLine = currentLine - 1;
						step = 1;
					}

					if(step == 1){
						newTexts = newTexts.replace(`${line}\n`, '');
					}

					if(line.includes(lastKeyword)){
						step = 2;
						break;
					}
				}

				if(step != 2){
					return resolve({
						status: false,
						error: "please don't update css & js import comment at index.html"
					})
				}

				fs.writeFile(fileName, newTexts, 'utf-8', (err, data) => {
					return resolve({
						status: true,
						data: { fileName, newTexts, firstLine: firstFoundLine, indent }
					});
				})
			})
		})
		.catch(err => {
			return {
				status: false,
				error: err
			}
		})
	}

	prependToEachLineExceptLast(input, prefix) {
  		const lines = input.split('\n');
  		return lines
    		.map((line, idx) => idx === lines.length - 1 ? line : prefix + line)
    		.join('\n');
	}

	async addIndent(collected, indent){
		const self = this;

		return self.prependToEachLineExceptLast(collected, indent);
	}

	async addLine(fileName, newText, insertedLine){
		const self = this;

		return new Promise((resolve) => {
			fs.readFile(fileName, 'utf8', (err, data) => {

				let __lines = data.split('\n');
				let lines = __lines.map((line, index) => index < __lines.length - 1 ? `${line}\n` : line);

				lines.splice(insertedLine, 0, newText);
				const newTexts = lines.join('');

				fs.writeFile(fileName, newTexts, 'utf-8', (err, data) => {
					return resolve({
						status: true,
						data: { fileName, newTexts }
					});
				})

			})
		})
		.catch(err => {
			return {
				status: false,
				error: err
			}
		})
	}

	async getRoutersSync(__path, _extensions = ['.js']) {
		const self = this;

    	const files = {};

    	//using sync, because it's only run when server is starting up and I dont want to get unnecessary headache
    	fs.readdirSync(__path)
        	.forEach( async (file) => {
            	const stats = fs.statSync(path.join(__path, file));

            	if (stats.isFile() && _extensions.includes(path.extname(file))) {
                	files[file] = path.resolve(__path, file);
            	} else if (stats.isDirectory()) {
                	//if file is a directory, recursively get all files inside it and add them into object
                	const tmp = await self.getRoutersSync(path.resolve(__path, file), _extensions);
                	for (let key in tmp) {
                    	files[path.join(file, key)] = tmp[key];
                	}
            	}
        	});

    	return files;
	};

	
}

export default new build();
