"use strict";

const http = require("./HttpWrapper");
const find = require("./Find");
/**
 * @summary An API for searching terms, images, and articles on Wikipedia.
 */
module.exports = new (class WikipediaAPI {
	constructor() {

		this.baseUrl = "https://{{language}}.wikipedia.org/w/api.php";
		this.request = {
			action: { query: "query" },
			/** Which pageimages information to return. */
			piprop: { thumbnail: "thumbnail" },
			/** Which additional langlinks properties to get for each interlanguage link. */
			llprop: { url: "url" },
			/** Which additional info properties to get. */
			inprop: { url: "url" },
			/** Automatically resolve redirects in query+titles, query+pageids, and query+revids, and in pages returned by query+generator. */
			redirects: { true: 1 },
			/** Return only content before the first section. */
			exintro: { true: 1 },
			/** Return extracts as plain text instead of limited HTML. */
			explaintext: { true: 1 },
			/** 
			 * The types of terms to get, e.g. "description", 
			 * each returned as an array of strings keyed by their type, 
			 * e.g. {"description": ["foo"]}. 
			 * If not specified, all types are returned. 
			 */
			wbptterms: {
				alias: "alias",
				label: "label",
				description: "description"
			},
			/** Which properties to get for the queried pages. */
			prop: {
				/** Returns information about images on the page, such as thumbnail and presence of photos. */
				pageimages: "pageimages",
				/** 
				 * Get a short description a.k.a. subtitle explaining what the target page is about.
				 * 
				 * The description is plain text, on a single line, but otherwise arbitrary (potentially including raw HTML tags, 
				 * which also should be interpreted as plain text). 
				 * It must not be used in HTML unescaped! 
				 */
				description: "description",
				/** Returns plain-text or limited HTML extracts of the given pages. */
				extracts: "extracts",
				/** Returns all interlanguage links from the given pages. */
				langlinks: "langlinks",
				/** Get basic page information. */
				info: "info",
				/** 
				 * Get the Wikidata terms (typically labels, descriptions and aliases) 
				 * associated with a page via a sitelink. 
				 * On the entity page itself, the terms are used directly. 
				 * Caveat: On a repo wiki, this module only works directly on entity pages, 
				 * not on pages connected to an entity via a sitelink. 
				 * This may change in the future. 
				 */
				pageterms: "pageterms"
			},
			/** Include an additional pageids section listing all returned page IDs. */
			indexpageids: { true: 1 },
			/** Get the list of pages to work on by executing the specified query module. */
			generator: {
				/** Perform a prefix search for page titles. */
				prefixsearch: "prefixsearch"
			},
			language: {
				english: "en",
				portuguese: "pt",
				russian: "ru"
			}
		};

	}

	/**
	 * @summary Searches an image on Wikipedia.
	 * @param {string} title A full or partial title to be searched for.
	 * @param {string} [language] The language code for the resultset.
	 * @param {number} thumbnailSize The height in pixels of the image;
	 * @returns {Promise<Object>} Returns a promise that resolves to an object.
	 */
	searchImage(title, language, thumbnailSize) {
		return new Promise(resolve => {

			var request = this.request;
			var url = this._buildUrl({
				language: language || request.language.english,
				titles: [title],
				action: request.action.query,
				prop: [request.prop.pageimages],
				piprop: [request.piprop.thumbnail],
				pithumbsize: thumbnailSize
			});

			http.get(url).then(resp => {
				let image = find("thumbnail", resp);

				resolve(image);

			}).catch(error => {

				let imageInfo = {};
				imageInfo.url = "";
				imageInfo.width = 250;
				imageInfo.height = 250;

				resolve(imageInfo);
			});
		});
	}

	/**
	 * @summary Searchs a single page on Wikipedia containing given term.
	 * @param {string} title A full or partial title to be searched for.
	 * @param {string} [language] The language code for the resultset.
	 * @returns {Promise<Object>} Returns a promise that resolves to an object.
	 */
	searchTitle(title, language, thumbnailSize) {

		return new Promise((resolve, reject) => {

			var request = this.request;
			var url = this._buildUrl({
				language: language || request.language.english,
				titles: [title],
				action: request.action.query,
				prop: [
					request.prop.pageimages,
					request.prop.description,
					request.prop.extracts,
					request.prop.langlinks,
					request.prop.info
				],
				piprop: [request.piprop.thumbnail],
				pithumbsize: thumbnailSize,
				exsentences: 3,
				exintro: request.exintro.true,
				explaintext: request.explaintext.true,
				llprop: request.llprop.url,
				inprop: request.inprop.url,
				redirects: request.redirects.true,
			});

			http.get(url).then(response => {

				let pages = find("pages", response);
				resolve(pages[0]);

			}).catch(reject);

		});
	}

	/**
	 * @summary Searchs a single page on Wikipedia containing given id.
	 * @param {number} pageId The id of an article's page.
	 * @param {string} [language] The language code for the resultset.
	 * @param {number} [imageSize=250] The height of the article's image, in pixel.
	 * @returns {Promise<Object>} Returns a promise that resolves to an object.
	 */
	getPageById(pageId, language, thumbnailSize = 250) {
		return new Promise((resolve, reject) => {

			var request = this.request;
			var url = this._buildUrl({
				language: language || request.language.english,
				action: request.action.query,
				prop: [
					request.prop.pageimages,
					request.prop.description,
					request.prop.extracts,
					request.prop.langlinks,
					request.prop.info
				],
				piprop: [request.piprop.thumbnail],
				pithumbsize: thumbnailSize,
				pilimit: 10,
				exsentences: 3,
				exintro: request.exintro.true,
				explaintext: request.explaintext.true,
				llprop: request.llprop.url,
				inprop: request.inprop.url,
				pageids: [pageId],
				indexpageids: request.indexpageids.true,
				redirects: request.redirects.true,
			});


			http.get(url).then(response => {

				let pages = find("pages", response);
				resolve(pages[0]);

			}).catch(reject);
		});
	}

	/**
	 * @summary Searchs a list of pages containing given term.
	 * @param {string} title A full or partial title to be searched for.
	 * @param {number} [imageSize=70] The height of the article's image, in pixel.
	 * @param {boolean} [includeDisambiguation=70] A boolean indicating whether to include disambiguation pages or not.
	 * @returns {Promise<Object>} Returns a promise that resolves to an object.
	 */
	searchResults(title, language, thumbnailSize = 70, includeDisambiguation = false) {
		return new Promise((resolve, reject) => {

			var request = this.request;
			var lang = language || request.language.english;

			var url = this._buildUrl({
				language: lang,
				action: request.action.query,
				prop: [
					request.prop.pageimages,
					request.prop.pageterms
				],
				piprop: [request.piprop.thumbnail],
				pilimit: 10,
				pithumbsize: thumbnailSize,
				generator: request.generator.prefixsearch,
				wbptterms: request.wbptterms.description,
				gpssearch: title,
				gpslimit: 10,
				redirects: request.redirects.true,
			});

			http.get(url).then(list => {
				let pages = find("pages", list);
				let data = [];
				var disambiguation = {
					en: "disambiguation",
					pt: "desambiguação",
					es: "desambiguación"
				};

				if (includeDisambiguation) {
					data = pages;
				}
				else {

					data = pages.filter(page => {
						let description = page.terms && page.terms.description[0] || "";
						var isDesambiguation = description.includes(disambiguation[language]);
						return !isDesambiguation;
					});
				}


				data.forEach(el => { el.lang = lang });
				data.sort((elA, elB) => elA.index - elB.index);

				resolve(data);

			}).catch(reject);
		});
	}

	/**
	 *
	 *
	 * @param {object} params
	 * @param {String} params.language
	 * @param {Array<string>} params.titles
	 * @param {String} params.action
	 * @param {Array<string>} params.prop
	 * @param {Array<string>} params.piprop
	 * @param {Number} pithumbsize
	 * @param {Number} pilimit
	 * @param {Number} exsentences
	 * @param {0|1} exintro
	 * @param {0|1} explaintext
	 * @param {String} llprop
	 * @param {String} inprop
	 * @param {Array<Number>} pageids
	 * @param {String} generator
	 * @param {String} wbptterms
	 * @param {String} gpssearch
	 * @param {Number} gpslimit
	 * @param {0|1} indexpageids
	 * @param {0|1} redirects
	 */
	_buildUrl(params) {
		var url = `${this.baseUrl.replace("{{language}}", params.language)}`;
		delete params.language;

		var parameters = [];

		Object.entries(params).forEach(entry => {
			let _key = entry[0];
			let _value = entry[1];

			if (Array.isArray(_value)) {
				_value = _value.join("|");
			}

			parameters.push(_key + "=" + _value);
		});

		parameters.push("format=json", "formatversion=2");
		url += `?${parameters.join("&")}`;

		return encodeURI(url);
	}
});