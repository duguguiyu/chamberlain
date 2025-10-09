/**
 * Capabilities Mock API
 */

export default {
  'GET /api/capabilities': {
    success: true,
    data: {
      'scenes.search': true,
      'scenes.sort': true,
      'configs.search': true,
      'configs.sort': true,
      'configs.filter': true,
    },
  },
};


