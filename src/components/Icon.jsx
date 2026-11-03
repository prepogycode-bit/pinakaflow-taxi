// Material Symbols Outlined - the font is loaded in index.html, so the glyph
// name is simply the text content.
export default function Icon({ name, className = '', style }) {
  return (
    <span className={`ms ${className}`.trim()} style={style} aria-hidden="true">
      {name}
    </span>
  )
}
