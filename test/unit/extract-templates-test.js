import { extractTemplates } from '../../lib/template-info.js';

function templateFromByteOffsets(source, start, end) {
  return source.slice(start, end + 1);
}

describe('extractTemplates', function () {
  const handlebarsTemplate = '<div></div>';
  const script =
    /* 1 */ 'export const SomeComponent = <template>\n' +
    /* 2 */ '<button></button>\n' +
    /* 3 */ '</template>';

  describe('extractTemplates with relativePath undefined (receiving input from stdin)', function () {
    it('returns the raw template if the content could be a template', function () {
      let result = extractTemplates(handlebarsTemplate, 'foo.hbs');
      expect(templateFromByteOffsets(handlebarsTemplate, 0, 10)).toMatchInlineSnapshot(
        `"<div></div>"`
      );
      expect(result[0]).toMatchObject({
        isEmbedded: undefined,
        isStrictMode: false,
        line: 1,
        columnOffset: 0,
      });
    });

    it('returns nothing if the content could be parsed as a script', function () {
      expect(extractTemplates(handlebarsTemplate)).toMatchInlineSnapshot(`[]`);
    });

    it('returns the parsed template if the content could be parsed as a script', function () {
      let result = extractTemplates(script);
      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({
        isEmbedded: true,
        isStrictMode: true,
        columnOffset: 0,
        line: 1,
      })
    });
  });

  describe('extractTemplates with relativePath', function () {
    it('returns the entire content as the extension is not a script file', function () {
      expect(extractTemplates(handlebarsTemplate, 'layout.hbs')).toMatchInlineSnapshot(`
        [
          {
            "column": 0,
            "columnOffset": 0,
            "end": 10,
            "isEmbedded": undefined,
            "isStrictMode": false,
            "line": 1,
            "start": 0,
            "template": "<div></div>",
            "templateMatch": undefined,
          },
        ]
      `);
    });
    it('returns the entire content as the extension is a script file', function () {
      expect(extractTemplates(script)).toMatchInlineSnapshot(`
        [
          {
            "column": 39,
            "columnOffset": 0,
            "end": 58,
            "isEmbedded": true,
            "isStrictMode": true,
            "line": 1,
            "start": 39,
            "template": "
        <button></button>
        ",
            "templateMatch": {
              "contentRange": {
                "end": 58,
                "start": 39,
              },
              "contents": "
        <button></button>
        ",
              "endRange": {
                "end": 69,
                "start": 58,
              },
              "range": {
                "end": 69,
                "start": 29,
              },
              "startRange": {
                "end": 39,
                "start": 29,
              },
              "tagName": "template",
              "type": "expression",
            },
          },
        ]
      `);
    });
  });
});

describe('extractTemplates with multiple templates', function () {
  const multiTemplateScript = [
    /* 1 */ `import type { TOC } from '@ember/component/template-only'`,
    /* 2 */ ``,
    /* 3 */ `export const A = <template>x</template>;`,
    /* 4 */ `export const B = <template>y</template>;`,
    /* 5 */ ``,
    /* 6 */ `export const C = <template>`,
    /* 7 */ `  {{yield}}`,
    /* 8 */ `</template> satisfies TOC<{ Blocks: { default: [] }}>`,
    /* 9 */ ``,
  ].join('\n');

  it('has correct templateInfos', function () {
    expect(extractTemplates(multiTemplateScript)).toMatchInlineSnapshot(`
      [
        {
          "column": 27,
          "columnOffset": 0,
          "end": 87,
          "isEmbedded": true,
          "isStrictMode": true,
          "line": 3,
          "start": 86,
          "template": "x",
          "templateMatch": {
            "contentRange": {
              "end": 87,
              "start": 86,
            },
            "contents": "x",
            "endRange": {
              "end": 98,
              "start": 87,
            },
            "range": {
              "end": 98,
              "start": 76,
            },
            "startRange": {
              "end": 86,
              "start": 76,
            },
            "tagName": "template",
            "type": "expression",
          },
        },
        {
          "column": 27,
          "columnOffset": 0,
          "end": 128,
          "isEmbedded": true,
          "isStrictMode": true,
          "line": 4,
          "start": 127,
          "template": "y",
          "templateMatch": {
            "contentRange": {
              "end": 128,
              "start": 127,
            },
            "contents": "y",
            "endRange": {
              "end": 139,
              "start": 128,
            },
            "range": {
              "end": 139,
              "start": 117,
            },
            "startRange": {
              "end": 127,
              "start": 117,
            },
            "tagName": "template",
            "type": "expression",
          },
        },
        {
          "column": 27,
          "columnOffset": 0,
          "end": 182,
          "isEmbedded": true,
          "isStrictMode": true,
          "line": 6,
          "start": 169,
          "template": "
        {{yield}}
      ",
          "templateMatch": {
            "contentRange": {
              "end": 182,
              "start": 169,
            },
            "contents": "
        {{yield}}
      ",
            "endRange": {
              "end": 193,
              "start": 182,
            },
            "range": {
              "end": 193,
              "start": 159,
            },
            "startRange": {
              "end": 169,
              "start": 159,
            },
            "tagName": "template",
            "type": "expression",
          },
        },
      ]
    `);
  });
});
