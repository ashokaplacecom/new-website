import { config, fields, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: { name: 'PlaceCom CMS' },
    navigation: {
      'Pages': ['homePage', 'aboutPage', 'podcastPage', 'teamPage'],
      'Data': ['contactData', 'companiesData', 'podcastData', 'reportsData', 'teamData', 'departmentsData', 'resourcesData'],
    },
  },
  singletons: {
    // ─── Markdown Pages ─────────────────────────────────────────────────────────
    homePage: singleton({
      label: 'Home Page',
      path: 'content/pages/home',
      format: { contentField: 'body' },
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({ label: 'Description' }),
        sections: fields.blocks(
          {
            'about-hero': {
              label: 'About Hero',
              schema: fields.object({
                heading: fields.text({ label: 'Heading' }),
                subheading: fields.text({ label: 'Subheading' }),
                backgroundImage: fields.image({
                  label: 'Background Image',
                  directory: 'public/images/uploads',
                  publicPath: '/images/uploads/',
                }),
                cta: fields.object({
                  label: fields.text({ label: 'Label' }),
                  href: fields.text({ label: 'URL' }),
                }),
                secondaryCta: fields.object({
                  label: fields.text({ label: 'Label' }),
                  href: fields.text({ label: 'URL' }),
                }),
              }),
            },
            'about-stats': {
              label: 'About Stats',
              schema: fields.object({
                heading: fields.text({ label: 'Heading' }),
                subheading: fields.text({ label: 'Subheading' }),
                columns: fields.integer({ label: 'Columns', defaultValue: 4 }),
                items: fields.array(
                  fields.object({
                    label: fields.text({ label: 'Label' }),
                    value: fields.text({ label: 'Value' }),
                    prefix: fields.text({ label: 'Prefix' }),
                    suffix: fields.text({ label: 'Suffix' }),
                  }),
                  { label: 'Stat Items', itemLabel: (props) => props.fields.label.value },
                ),
              }),
            },
            cards: {
              label: 'Cards Block',
              schema: fields.object({
                heading: fields.text({ label: 'Heading' }),
                columns: fields.integer({ label: 'Columns', defaultValue: 2 }),
                items: fields.array(
                  fields.object({
                    title: fields.text({ label: 'Title' }),
                    description: fields.text({ label: 'Description', multiline: true }),
                    image: fields.image({
                      label: 'Image',
                      directory: 'public/images/uploads',
                      publicPath: '/images/uploads/',
                    }),
                    href: fields.text({ label: 'Link URL' }),
                    text: fields.text({ label: 'Text' }),
                  }),
                  { label: 'Card Items', itemLabel: (props) => props.fields.title.value },
                ),
              }),
            },
            content: {
              label: 'Content Block',
              schema: fields.object({
                id: fields.text({ label: 'ID' }),
              }),
            },
          },
          { label: 'Sections' },
        ),
        body: fields.markdoc({ label: 'Body', extension: 'md' }),
      },
    }),

    aboutPage: singleton({
      label: 'About Page',
      path: 'content/pages/about',
      format: { contentField: 'body' },
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({ label: 'Description' }),
        sections: fields.array(
          fields.object({
            type: fields.text({ label: 'Type' }),
            heading: fields.text({ label: 'Heading' }),
            subheading: fields.text({ label: 'Subheading' }),
            backgroundImage: fields.text({ label: 'Background Image URL' }),
          }),
          { label: 'Sections', itemLabel: (props) => props.fields.type.value },
        ),
        body: fields.markdoc({ label: 'Body', extension: 'md' }),
      },
    }),

    podcastPage: singleton({
      label: 'Podcast Page',
      path: 'content/pages/podcast',
      format: { contentField: 'body' },
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({ label: 'Description' }),
        sections: fields.array(
          fields.object({
            type: fields.text({ label: 'Type' }),
            heading: fields.text({ label: 'Heading' }),
            subheading: fields.text({ label: 'Subheading' }),
            backgroundImage: fields.text({ label: 'Background Image URL' }),
          }),
          { label: 'Sections', itemLabel: (props) => props.fields.type.value },
        ),
        body: fields.markdoc({ label: 'Body', extension: 'md' }),
      },
    }),

    teamPage: singleton({
      label: 'Team Page',
      path: 'content/pages/team',
      format: { contentField: 'body' },
      schema: {
        title: fields.text({ label: 'Title' }),
        description: fields.text({ label: 'Description' }),
        sections: fields.array(
          fields.object({
            type: fields.text({ label: 'Type' }),
            heading: fields.text({ label: 'Heading' }),
            subheading: fields.text({ label: 'Subheading' }),
            backgroundImage: fields.text({ label: 'Background Image URL' }),
          }),
          { label: 'Sections', itemLabel: (props) => props.fields.type.value },
        ),
        body: fields.markdoc({ label: 'Body', extension: 'md' }),
      },
    }),

    // ─── JSON Data Singletons ───────────────────────────────────────────────────
    contactData: singleton({
      label: 'Contact Information',
      path: 'content/data/contact',
      format: { data: 'json' },
      schema: {
        emails: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            address: fields.text({ label: 'Email Address' }),
          }),
          { label: 'Emails', itemLabel: (props) => props.fields.label.value },
        ),
        phones: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            number: fields.text({ label: 'Number' }),
          }),
          { label: 'Phone Numbers', itemLabel: (props) => props.fields.label.value },
        ),
      },
    }),

    companiesData: singleton({
      label: 'Recruiting Partners',
      path: 'content/data/companies',
      format: { data: 'json' },
      schema: {
        companies: fields.array(
          fields.object({
            name: fields.text({ label: 'Company Name' }),
            src: fields.text({ label: 'Logo URL', description: 'Leave blank to show company name as text' }),
          }),
          { label: 'Companies', itemLabel: (props) => props.fields.name.value },
        ),
      },
    }),

    podcastData: singleton({
      label: 'Podcast Episodes',
      path: 'content/data/podcast',
      format: { data: 'json' },
      schema: {
        episodes: fields.array(
          fields.object({
            id: fields.text({ label: 'ID' }),
            title: fields.text({ label: 'Title' }),
            spotifyEmbedUrl: fields.text({ label: 'Spotify Embed URL' }),
            description: fields.text({ label: 'Description', multiline: true }),
          }),
          { label: 'Episodes', itemLabel: (props) => props.fields.title.value },
        ),
      },
    }),

    reportsData: singleton({
      label: 'Monthly Reports',
      path: 'content/data/reports',
      format: { data: 'json' },
      schema: {
        entries: fields.array(
          fields.object({
            id: fields.text({ label: 'ID (slug)', description: 'URL-safe slug, e.g. march-2024' }),
            month: fields.text({ label: 'Month Label', description: 'e.g. March 2024' }),
            oneLiner: fields.text({ label: 'One-liner Summary', multiline: true }),
            pdfEmbedUrl: fields.text({ label: 'PDF Embed URL', description: 'Google Drive preview link' }),
          }),
          { label: 'Entries', itemLabel: (props) => props.fields.month.value },
        ),
      },
    }),

    teamData: singleton({
      label: 'Team Members',
      path: 'content/data/team',
      format: { data: 'json' },
      schema: {
        members: fields.array(
          fields.object({
            name: fields.text({ label: 'Full Name' }),
            role: fields.text({ label: 'Role' }),
            batch: fields.text({ label: 'Batch Year' }),
            image: fields.image({
              label: 'Photo',
              directory: 'public/images/uploads',
              publicPath: '/images/uploads/',
            }),
          }),
          { label: 'Members', itemLabel: (props) => props.fields.name.value },
        ),
      },
    }),

    departmentsData: singleton({
      label: 'Departments',
      path: 'content/data/departments',
      format: { data: 'json' },
      schema: {
        departments: fields.array(
          fields.object({
            id: fields.text({ label: 'ID' }),
            name: fields.text({ label: 'Department Name' }),
            writeup: fields.text({ label: 'Writeup', multiline: true }),
            leaders: fields.array(
              fields.object({
                name: fields.text({ label: 'Name' }),
                role: fields.text({ label: 'Role' }),
                image: fields.image({
                  label: 'Photo',
                  directory: 'public/images/uploads',
                  publicPath: '/images/uploads/',
                }),
              }),
              { label: 'Leaders', itemLabel: (props) => props.fields.name.value },
            ),
            members: fields.array(
              fields.object({
                name: fields.text({ label: 'Name' }),
                role: fields.text({ label: 'Role' }),
              }),
              { label: 'Members', itemLabel: (props) => props.fields.name.value },
            ),
          }),
          { label: 'Departments', itemLabel: (props) => props.fields.name.value },
        ),
      },
    }),

    resourcesData: singleton({
      label: 'Resources Library',
      path: 'content/resources',
      format: { data: 'json' },
      schema: {
        resources: fields.array(
          fields.object({
            id: fields.text({ label: 'ID' }),
            name: fields.text({ label: 'Name' }),
            type: fields.select({
              label: 'Type',
              defaultValue: 'folder',
              options: [
                { label: 'Folder', value: 'folder' },
                { label: 'File', value: 'file' },
              ],
            }),
            fileType: fields.select({
              label: 'File Type',
              defaultValue: 'document',
              options: [
                { label: 'Document', value: 'document' },
                { label: 'Presentation', value: 'presentation' },
                { label: 'Spreadsheet', value: 'spreadsheet' },
                { label: 'Image', value: 'image' },
                { label: 'Link', value: 'link' },
              ],
            }),
            url: fields.text({ label: 'URL' }),
            description: fields.text({ label: 'Description', multiline: true }),
            badges: fields.array(
              fields.object({
                label: fields.text({ label: 'Label' }),
                variant: fields.select({
                  label: 'Variant',
                  defaultValue: 'default',
                  options: [
                    { label: 'Default', value: 'default' },
                    { label: 'Secondary', value: 'secondary' },
                    { label: 'Outline', value: 'outline' },
                    { label: 'Destructive', value: 'destructive' },
                  ],
                }),
              }),
              { label: 'Badges', itemLabel: (props) => props.fields.label.value },
            ),
            // Keystatic does not support recursive schemas. For deeply nested resources,
            // store children as a raw JSON string and parse it on the frontend.
            children: fields.text({
              label: 'Children (JSON)',
              description: 'Paste nested children as a JSON array. Used for sub-folders/files.',
              multiline: true,
            }),
          }),
          { label: 'Resources', itemLabel: (props) => props.fields.name.value },
        ),
      },
    }),
  },
});
