/**
 * HTML utility functions for text processing
 */
export class HtmlHelper {
  /**
   * Common HTML entities mapping
   */
  private static readonly HTML_ENTITIES: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™'
  };

  /**
   * Decode HTML entities in text
   * @param text Text containing HTML entities
   * @returns Decoded text
   * @example
   * HtmlHelper.decodeEntities('&lt;div&gt;Hello &amp; Goodbye&lt;/div&gt;')
   * // Returns: '<div>Hello & Goodbye</div>'
   */
  static decodeEntities(text: string): string {
    if (!text) return text;
    
    // Replace named entities
    let decoded = text.replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp|copy|reg|trade);/g, 
      match => this.HTML_ENTITIES[match] || match
    );
    
    // Replace numeric entities (e.g., &#60; or &#x3C;)
    decoded = decoded.replace(/&#(\d+);/g, (_, dec) => 
      String.fromCharCode(Number.parseInt(dec, 10))
    );
    
    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => 
      String.fromCharCode(Number.parseInt(hex, 16))
    );
    
    return decoded;
  }

  /**
   * Encode special characters to HTML entities
   * @param text Text to encode
   * @returns Encoded text
   * @example
   * HtmlHelper.encodeEntities('<div>Hello & Goodbye</div>')
   * // Returns: '&lt;div&gt;Hello &amp; Goodbye&lt;/div&gt;'
   */
  static encodeEntities(text: string): string {
    if (!text) return text;
    
    const reverseEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    
    return text.replace(/[&<>"']/g, char => reverseEntities[char] || char);
  }

  /**
   * Strip HTML tags from text
   * @param html HTML string
   * @returns Plain text
   * @example
   * HtmlHelper.stripTags('<p>Hello <b>World</b></p>')
   * // Returns: 'Hello World'
   */
  static stripTags(html: string): string {
    if (!html) return html;
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Normalize whitespace in text (collapse multiple spaces, trim)
   * @param text Text to normalize
   * @returns Normalized text
   */
  static normalizeWhitespace(text: string): string {
    if (!text) return text;
    return text.replace(/\s+/g, ' ').trim();
  }
}
