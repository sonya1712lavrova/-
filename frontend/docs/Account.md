# Account component states (UI Kit • B2B)

Props:
- variant: 'avatar' | 'rich'
- name?: string
- role?: string
- photoSrc?: string

Variants:
- avatar: only avatar inside capsule
- rich: name + role + avatar

States and visuals:
- Default:
  - avatar-only: background var(--Basic-Background-bg-secondary, #F5F3F1); border 1px transparent
  - rich: background var(--Basic-Background-bg-secondary, #F5F3F1); border 1px transparent
- Hover:
  - both: background var(--Basic-Background-bg-primary, #FFF); border-color #FFF
- Focus-visible:
  - both: outline 3px var(--focus-ring), offset 2px
- Active:
  - both: translateY(0.5px)

Avatar:
- 40x40, circular, centered (display:flex; align/justify center)

Typography (rich):
- Name: 14/18, 500, text-right, font-variant-numeric: lining-nums proportional-nums, color var(--Basic-Content-text-primary, #191817)
- Role: 12/14, 400, text-right, font-variant-numeric: lining-nums proportional-nums, color var(--Basic-Content-text-secondary-solid, #8C8A87)

Files:
- Component: src/components/Account.tsx
- Styles: src/App.css (.account-avatar-only, .account-rich, .account-text, .account-name, .account-role, .account-avatar)

