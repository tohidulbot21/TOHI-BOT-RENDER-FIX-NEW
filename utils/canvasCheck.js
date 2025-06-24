
/**
 * Universal Canvas availability checker
 */
class CanvasCheck {
  static isAvailable() {
    try {
      require('canvas');
      return true;
    } catch (error) {
      return false;
    }
  }

  static getCanvas() {
    try {
      const Canvas = require('canvas');
      return {
        createCanvas: Canvas.createCanvas,
        loadImage: Canvas.loadImage,
        registerFont: Canvas.registerFont,
        available: true
      };
    } catch (error) {
      return {
        createCanvas: null,
        loadImage: null,
        registerFont: null,
        available: false,
        error: error.message
      };
    }
  }

  static handleCanvasError(commandName, error) {
    console.warn(`⚠️ Canvas error in ${commandName}:`, error.message);
    return {
      body: `❌ Image generation temporarily unavailable for ${commandName}\n\n🔧 Error: Canvas dependency issue\n📝 Text-only mode active`,
      error: true
    };
  }
}

module.exports = CanvasCheck;
