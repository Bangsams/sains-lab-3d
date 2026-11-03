// Dibuat dari kode asli Datmin Automation APP. Jangan diedit manual.
export default `{
  "functions": {
    "api/simulate.js": {
      "maxDuration": 300,
      "includeFiles": "data/**"
    },
    "api/status.js": {
      "maxDuration": 60
    },
    "api/key.js": {
      "maxDuration": 30,
      "includeFiles": "data/keys/**"
    },
    "api/grade.js": {
      "maxDuration": 60
    },
    "api/sheet.js": {
      "maxDuration": 60
    },
    "api/files.js": {
      "maxDuration": 60
    },
    "api/stat.js": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "noindex"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "buildCommand": "node build/retheme.js",
  "outputDirectory": "public",
  "framework": null
}`;
