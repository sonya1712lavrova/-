# bui_Navigation menu (Header) — Spec Snapshot

Current canonical implementation in code. Use this as the style source of truth.

## Layout
- Container: `.header`
  - width: 100%
  - padding: 8px 24px 0 24px
  - background: `var(--Basic-Background-bg-secondary, #F5F3F1)`
  - border-bottom: none
  - display: flex; align-items: center
- Right side: `.header-right-side`
  - children order: `.logo` → `.nav` → `SearchField`
  - gap between logo and nav: 8px
  - gap between last nav item and SearchField: 12px
- Left side: `.header-left-side`
  - order: chat button, bell button, `Account`
  - chat/bell gap: 0px
  - bell → Account gap: 12px
  - `margin-left: auto` to push left side to the far right

## Logo
- Element: `.logo`
  - size: 36×36
  - radius: 120px
  - rendered via mask: `-webkit-mask`/`mask` url('/icons/nav_logo.svg') center/contain no-repeat
  - default color: `var(--Basic-Content-text-primary, #191817)`
  - hover:
    - icon color: `#F7614A` (Experiments/icon-ai)
    - border: 3px solid #FFF
  - box-sizing: border-box to preserve size on hover border

## Menu items
- Element: `.menu-item`
  - size: 36px height; padding: 8px 12px
  - radius: 120px
  - typography: Text Desk/14 Normal・Med (14/18, 500)
  - gaps between items: 4px
  - hover: background `var(--Basic-Background-bg-primary, #FFF)`
  - active: background `var(--color-surface)`, color `var(--color-text)`

## SearchField
- Container: `.nav-search` (186×36, radius 12)
  - default: background `var(--Basic-Background-bg-secondary, #F5F3F1)`, border `--basic-border-divider-border-primary`
  - hover: background `--Interactions-Background-bg-primary-hover`, border `--interactions-border-divider-border-primary-hover`
  - input padding: `0 50px 0 16px`
  - right inner elements (absolute):
    - divider: 1×12, 6px from icon, centered vertically
    - icon: 24×24, 6px from right edge
  - typography: Text Desk/14 Normal・Med (14/18, 500)

## Icon buttons (chat/bell)
- `.icon-button`
  - size: 40×40, circle, center-align icon (24×24)
  - hover background: `var(--Basic-Background-bg-primary, #FFF)`

## Account (avatar variant)
- Default: background `var(--Basic-Background-bg-secondary, #F5F3F1)`, border transparent
- Hover: border-color #FFF (white ring)
- Focus: outline `var(--focus-ring)`
- Active: translateY(0.5px)
- Avatar: 40×40, circle, centered

## Tokens used
- Basic backgrounds: `--Basic-Background-bg-secondary`, `--Basic-Background-bg-primary`
- Content: `--Basic-Content-text-primary`, `--Basic-Content-text-secondary-solid`
- Dividers: `--basic-border-divider-border-primary`, `--interactions-border-divider-border-primary-hover`
- Interactions background: `--Interactions-Background-bg-primary-hover`
- Focus: `--focus-ring`


