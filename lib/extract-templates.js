import * as utils from 'content-tag-utils';

export const SUPPORTED_EXTENSIONS = ['.gjs', '.gts'];
const HBS = '.hbs';
const HTML = '.html';
const LOCATION_START = Object.freeze({ line: 1, column: 0, start: 0, end: 0, columnOffset: 0 });

export function isSupported(filePath = '') {
  return isGlimmerFileExtension(filePath) || isHBS(filePath) || isHTML(filePath);
}

export function isGlimmerFileExtension(filePath = '') {
  return SUPPORTED_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}

export function isHBS(filePath = '') {
  return filePath.endsWith(HBS);
}

function isHTML(filePath = '') {
  return filePath.endsWith(HTML);
}

/**
 * Processes results and corrects for template location offsets.
 *
 * @typedef {object} TemplateInfo
 * @property {number} line
 * @property {number} column
 * @property {string} template
 * @property {boolean} isEmbedded
 *
 * @param {string} moduleSource
 * @param {string} relativePath
 *
 * @returns {TemplateInfo[]}
 */
export function extractTemplates(moduleSource, relativePath) {
  // If no relativePath is present, assuming we might have templates.
  let isGlimmer = isGlimmerFileExtension(relativePath);

  if (!isGlimmer) {
    if (isHBS(relativePath) || isHTML(relativePath)) {
      return [
        {
          ...makeTemplateInfo(
            {
              ...LOCATION_START,
              end: moduleSource.length - 1,
            },
            moduleSource
          ),
          isEmbedded: undefined,
          isStrictMode: false,
        },
      ];
    }
  }

  // early exit if we don't have </template>
  // this is a small speed boost for gjs/gts that don't define components.

  if (!moduleSource.includes('</template>')) {
    return [];
  }

  return utils.extractTemplates(moduleSource);
}

/**
 * @param {object} location
 * @param {number} location.line
 * @param {number} location.column
 * @param {string} template
 * @param {object} parsed
 *
 * @returns {TemplateInfo}
 */
function makeTemplateInfo(location, template, parsed) {
  let { line, column, start, end, columnOffset } = location;
  return {
    line,
    start,
    end,
    column,
    columnOffset,
    template,
    isEmbedded: true,
    isStrictMode: true,
    templateMatch: parsed,
  };
}
