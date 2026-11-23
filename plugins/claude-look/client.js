window.__ModuleLoader__.load({
  id: '@local/claude-look',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'claude-look';
    const SOURCE = 'claude-look';

    /* ------------------------------------------------------------------ */
    /* Claude-style warm palette (light + dark)                            */
    /* ------------------------------------------------------------------ */

    const pair = (light, dark) => ({ light, dark });

    const TOKENS = {
      /* surfaces */
      '--dsw-alias-bg-base': pair('#FFFFFF', '#181817'),
      '--dsw-alias-bg-layer-1': pair('#FFFFFF', '#20201F'),
      '--dsw-alias-bg-layer-2': pair('#F3F3F0', '#2C2C2A'),
      '--dsw-alias-bg-layer-3': pair('#EDECE8', '#383835'),
      '--dsw-alias-bg-overlay': pair('#FFFFFF', '#2C2C2A'),
      '--dsw-alias-bg-module-platform': pair('#F7F6F4', '#2C2C2A'),
      '--dsw-alias-bg-multi-select': pair('#F7F6F4', '#383835'),
      '--dsw-alias-bg-document-preview': pair('#FDFCFC', '#181817'),
      '--dsw-alias-bg-document-selection': pair('rgba(217, 119, 87, 0.20)', 'rgba(217, 119, 87, 0.28)'),
      '--dsw-alias-bg-skeleton': pair('rgba(31, 30, 29, 0.06)', 'rgba(245, 244, 239, 0.08)'),
      '--dsw-alias-bg-mask-1': pair('rgba(0, 0, 0, 0.24)', 'rgba(0, 0, 0, 0.50)'),
      '--dsw-alias-bg-mask-2': pair('rgba(0, 0, 0, 0.12)', 'rgba(0, 0, 0, 0.20)'),
      '--dsw-alias-bg-mask-3': pair('rgba(0, 0, 0, 0.48)', 'rgba(0, 0, 0, 0.48)'),
      '--dsw-alias-bg-mask-photo': pair('rgba(0, 0, 0, 0.88)', 'rgba(0, 0, 0, 0.88)'),
      '--dsw-alias-bg-mask-drop': pair('rgba(250, 249, 245, 0.70)', 'rgba(31, 30, 29, 0.70)'),

      /* borders */
      '--dsw-alias-border-l1': pair('rgba(31, 30, 29, 0.06)', 'rgba(245, 244, 239, 0.08)'),
      '--dsw-alias-border-l2': pair('rgba(31, 30, 29, 0.10)', 'rgba(245, 244, 239, 0.16)'),
      '--dsw-alias-border-l3': pair('rgba(31, 30, 29, 0.16)', 'rgba(245, 244, 239, 0.20)'),
      '--dsw-alias-border-l4': pair('rgba(31, 30, 29, 0.24)', 'rgba(245, 244, 239, 0.26)'),
      '--dsw-alias-border-l2-darkmode-thin': pair('rgba(31, 30, 29, 0.08)', 'rgba(245, 244, 239, 0.08)'),
      '--dsw-alias-border-inverted': pair('transparent', 'rgba(255, 255, 255, 0.06)'),
      '--dsw-alias-border-inverted2': pair('transparent', 'rgba(255, 255, 255, 0.08)'),

      /* text */
      '--dsw-alias-label-primary': pair('#1F1E1D', '#FCFCFB'),
      '--dsw-alias-label-primary-dimmed': pair('#37352F', '#E8E5DB'),
      '--dsw-alias-label-primary-inverted': pair('#FFFFFF', '#1F1E1D'),
      '--dsw-alias-label-primary-foreground': pair('#FFFFFF', '#1F1E1D'),
      '--dsw-alias-label-primary-bluish': pair('#1F1E1D', '#F5F4EF'),
      '--dsw-alias-label-secondary': pair('#5C5A54', '#C3C2B7'),
      '--dsw-alias-label-tertiary': pair('#838077', '#A5A49A'),
      '--dsw-alias-label-caption': pair('#A7A399', '#898781'),
      '--dsw-alias-label-dimmed': pair('#D6D2C6', '#4A4942'),
      '--dsw-alias-label-shimmer': pair('rgba(31, 30, 29, 0.28)', 'rgba(245, 244, 239, 0.38)'),
      '--dsw-alias-label-deep-diving': pair('#9C5B3F', '#E79B7D'),
      '--dsw-alias-label-deep-diving-shimmer': pair('rgba(156, 91, 63, 0.35)', 'rgba(231, 155, 125, 0.40)'),
      '--dsw-alias-label-document-preview': pair('#5C5A54', '#C2BEB3'),

      /* brand + links */
      '--dsw-alias-brand-primary': pair('#1F1E1D', '#F5F4EF'),
      '--dsw-alias-brand-primary-invert': pair('#1F1E1D', '#F5F4EF'),
      '--dsw-alias-brand-primary-new-colorprimary-new-color': pair('#D97757', '#D97757'),
      '--dsw-alias-brand-text': pair('#1F1E1D', '#F5F4EF'),
      '--dsw-alias-link': pair('#BC5B3C', '#E79B7D'),
      '--claude-look-accent': pair('#D97757', '#E79B7D'),

      /* buttons */
      '--dsw-alias-button-contrast-fill': pair('#1F1E1D', '#F5F4EF'),
      '--dsw-alias-button-elevated-fill': pair('#FFFFFF', '#36352F'),
      '--dsw-alias-button-floating-fill': pair('#FFFFFF', '#30302E'),
      '--dsw-alias-button-floating-hover': pair('#F6F4EE', '#3D3C36'),
      '--dsw-alias-button-ghost-active-border': pair('rgba(31, 30, 29, 0.24)', 'rgba(245, 244, 239, 0.30)'),
      '--dsw-alias-button-ghost-active-fill': pair('#F0EEE6', '#3D3C36'),
      '--dsw-alias-button-ghost-active-hover': pair('#E6E2D7', '#42413A'),
      '--dsw-alias-button-info-fill': pair('#D97757', '#D97757'),
      '--dsw-alias-button-info-hover': pair('#BC5B3C', '#BC5B3C'),
      '--dsw-alias-button-primary-dimmed': pair('#F0EEE6', '#3D3C36'),
      '--dsw-alias-button-primary-fill': pair('#1F1E1D', '#F5F4EF'),
      '--dsw-alias-button-primary-hover': pair('#37352F', '#E8E5DB'),
      '--dsw-alias-button-tool-bar-fill': pair('rgba(70, 68, 62, 0.56)', 'rgba(70, 68, 62, 0.56)'),
      '--dsw-alias-button-tool-bar-fill-invisible': pair('rgba(31, 30, 29, 0.36)', 'rgba(31, 30, 29, 0.36)'),
      '--dsw-alias-button-tool-bar-hover': pair('rgba(56, 54, 49, 0.66)', 'rgba(56, 54, 49, 0.66)'),

      /* interaction */
      '--dsw-alias-interactive-bg-hover': pair('rgba(31, 30, 29, 0.06)', 'rgba(245, 244, 239, 0.08)'),
      '--dsw-alias-interactive-bg-active': pair('rgba(31, 30, 29, 0.10)', 'rgba(245, 244, 239, 0.14)'),
      '--dsw-alias-interactive-bg-hover-solid': pair('#F6F4EE', '#3D3C36'),
      '--dsw-alias-interactive-bg-hover-accent': pair('rgba(217, 119, 87, 0.14)', 'rgba(217, 119, 87, 0.20)'),
      '--dsw-alias-interactive-bg-hover-danger': pair('rgba(193, 67, 47, 0.07)', 'rgba(240, 138, 117, 0.16)'),

      /* markdown */
      '--dsw-alias-markdown-citation': pair('#F0EEE6', '#3D3C36'),
      '--dsw-alias-markdown-code-block': pair('#F0EEE6', '#1F1E1D'),
      '--dsw-alias-markdown-code-block-banner': pair('#E9E6DB', '#2C2B28'),
      '--dsw-alias-markdown-code-segment-selected': pair('#FFFFFF', '#30302E'),
      '--dsw-alias-markdown-code-segment-unselected': pair('#E9E6DB', '#262624'),
      '--dsw-alias-markdown-inline-code': pair('#F0EEE6', '#36352F'),
      '--dsw-alias-markdown-placeholder': pair('#F0EEE6', '#36352F'),
      '--dsw-alias-markdown-tag': pair('#E9E6DB', '#3D3C36'),

      /* scrollbars */
      '--dsw-alias-scrollbar-bg-l1': pair('#E4E1D5', '#3B3A34'),
      '--dsw-alias-scrollbar-bg-l2': pair('#DDD9CC', '#45443D'),
      '--dsw-alias-scrollbar-hover-l1': pair('#CFCABD', '#56544C'),
      '--dsw-alias-scrollbar-hover-l2': pair('#C3BEAF', '#625F56'),

      /* states */
      '--dsw-alias-state-business-primary': pair('#D97757', '#D97757'),
      '--dsw-alias-state-business-tertiary': pair('#F6E4DB', '#3A2B25'),
      '--dsw-alias-state-idle-primary': pair('#C9C5B7', '#57554D'),
      '--dsw-alias-state-error-primary': pair('#C1432F', '#F08A75'),
      '--dsw-alias-state-error-secondary': pair('#E08A75', '#F08A75'),
      '--dsw-alias-state-success-primary': pair('#3F7A4D', '#6FBF85'),
      '--dsw-alias-state-success-secondary': pair('#6FBF85', '#6FBF85'),
      '--dsw-alias-state-success-tertiary': pair('#E5F0E4', '#1F2E22'),
      '--dsw-alias-state-warn-primary': pair('#C08A2E', '#E0B15A'),
      '--dsw-alias-state-warn-secondary': pair('#E0B15A', '#E0B15A'),
      '--dsw-alias-state-warn-tertiary': pair('#F6EBD5', '#332817'),
      '--dsw-alias-state-warn-label': pair('#9E6E1D', '#E0B15A'),

      /* diffs */
      '--dsw-alias-code-diff-added': pair('rgba(63, 122, 77, 0.10)', 'rgba(111, 191, 133, 0.14)'),
      '--dsw-alias-code-diff-deleted': pair('rgba(193, 67, 47, 0.10)', 'rgba(240, 138, 117, 0.16)'),
      '--dsw-alias-file-diff-added-bg': pair('#EAF1E7', '#1F2B21'),
      '--dsw-alias-file-diff-added-gutter': pair('#F1F6EE', '#172019'),
      '--dsw-alias-file-diff-added-marker': pair('#3F7A4D', '#6FBF85'),
      '--dsw-alias-file-diff-deleted-bg': pair('#F7E4DE', '#3A231E'),
      '--dsw-alias-file-diff-deleted-gutter': pair('#FBEDE9', '#28130E'),
      '--dsw-alias-file-diff-deleted-marker': pair('#C1432F', '#F08A75'),

      /* chrome */
      '--dsw-alias-switch-thumb': pair('#FFFFFF', '#C2BEB3'),
      '--dsw-alias-toast-bg': pair('#1F1E1D', '#3A3934'),
      '--dsw-alias-toast-label': pair('#F5F4EF', '#F5F4EF'),
      '--dsw-alias-tooltip-bg': pair('#1F1E1D', '#3A3934'),
      '--dsw-alias-tooltip-key-bg': pair('rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0.16)'),
      '--dsw-alias-turn-trigger-bg': pair('#F0EEE6', '#36352F'),
      '--dsw-alias-turn-trigger-bg-hover': pair('#E9E6DB', '#3D3C36'),
      '--dsw-alias-menu-group-header-fill': pair('rgba(250, 249, 245, 0.95)', 'rgba(48, 48, 46, 0.95)'),
      '--dsw-alias-menu-icon': pair('#46443E', '#D5D2C8'),
      '--dsw-alias-settings-card-fill': pair('#F6F4EE', '#36352F'),
      '--dsw-alias-settings-card-stroke': pair('rgba(31, 30, 29, 0.24)', 'rgba(245, 244, 239, 0.26)'),

      /* specific surfaces */
      '--dsw-menu-surface-fill': pair('rgba(250, 249, 245, 0.95)', 'rgba(48, 48, 46, 0.95)'),
      '--dsw-specific-menu': pair('rgba(250, 249, 245, 0.95)', 'rgba(48, 48, 46, 0.95)'),
      '--dsw-specific-bubble': pair('#F0EEE6', '#36352F'),
      '--dsw-specific-bubble-highlight': pair('#E9E6DB', '#3D3C36'),
      '--dsw-specific-input-major': pair('#FFFFFF', '#36352F'),
      '--dsw-specific-login-input': pair('#F6F4EE', '#262624'),
      '--dsw-specific-selector': pair('#F0EEE6', '#3D3C36'),
      '--dsw-specific-tip': pair('#F0EEE6', '#36352F'),
      '--dsw-specific-sidebar-fill': pair('#FDFCFC', '#1C1C1B'),
      '--dsw-specific-sidebar-nav-item-hover': pair('#F3F2EF', '#33322D'),
      '--dsw-specific-sidebar-nav-item-active': pair('#EFEEEA', '#3A3934'),
      '--dsw-specific-sidebar-nav-item-active-accent': pair('#F6E4DB', '#3A2B25'),

      /* warm replacements for the static neutrals the shell also reads directly */
      '--dsw-static-neutral-bluish-50': pair('#FAF9F5', '#F5F4EF'),
      '--dsw-static-neutral-bluish-60': pair('#F6F4EE', '#EFEDE5'),
      '--dsw-static-neutral-bluish-75': pair('#F0EEE6', '#E8E5DB'),
      '--dsw-static-neutral-bluish-100': pair('#EAE7DD', '#DDD9CC'),
      '--dsw-static-neutral-bluish-150': pair('#E5E2D7', '#D4D0C3'),
      '--dsw-static-neutral-bluish-200': pair('#DDD9CC', '#C9C5B7'),
      '--dsw-static-neutral-bluish-300': pair('#C9C5B7', '#B0ACA0'),
      '--dsw-static-neutral-bluish-400': pair('#A7A399', '#969286'),
      '--dsw-static-neutral-bluish-500': pair('#8E8A80', '#827E74'),
      '--dsw-static-neutral-bluish-600': pair('#736F66', '#6E6A61'),
      '--dsw-static-neutral-bluish-700': pair('#5C5A54', '#5A574F'),
      '--dsw-static-neutral-bluish-750': pair('#44423C', '#45433C'),
      '--dsw-static-neutral-bluish-800': pair('#37352F', '#3A3934'),
      '--dsw-static-neutral-bluish-850': pair('#2D2C28', '#31302B'),
      '--dsw-static-neutral-bluish-875': pair('#252420', '#2B2A26'),
      '--dsw-static-neutral-bluish-900': pair('#1D1C19', '#262624'),
      '--dsw-static-neutral-bluish-950': pair('#171614', '#201F1C'),
      '--dsw-static-neutral-bluish-1000': pair('#12110F', '#151412'),
      '--dsw-static-neutral-50': pair('#FAF9F5', '#F5F4EF'),
      '--dsw-static-neutral-100': pair('#F2F0E9', '#EDEAE1'),
      '--dsw-static-neutral-150': pair('#EAE7DD', '#E5E1D6'),
      '--dsw-static-neutral-200': pair('#E2DED2', '#DCD8CC'),
      '--dsw-static-neutral-250': pair('#D8D4C7', '#D2CEC1'),
      '--dsw-static-neutral-300': pair('#CBC7BA', '#C4C0B3'),
      '--dsw-static-neutral-400': pair('#9C988E', '#9A968C'),
      '--dsw-static-neutral-500': pair('#7A766C', '#7C786E'),
      '--dsw-static-neutral-550': pair('#625F56', '#666259'),
      '--dsw-static-neutral-600': pair('#55524A', '#59564E'),
      '--dsw-static-neutral-700': pair('#3B3A34', '#3F3E37'),
      '--dsw-static-neutral-800': pair('#2C2B27', '#30302A'),
      '--dsw-static-neutral-850': pair('#262521', '#2A2925'),
      '--dsw-static-neutral-900': pair('#181714', '#1C1B18'),
      '--dsw-static-neutral-1000': pair('#0E0D0B', '#121110')
    };

    /* ------------------------------------------------------------------ */
    /* Brand mark: original ten-ray sunburst                               */
    /* ------------------------------------------------------------------ */

    /* Claude's brand mark is the desktop app icon's starburst
       (_research/claude-app/icon.png), traced to an alpha mask: the shape is
       authentic and takes any accent colour and size instead of a hand-drawn
       approximation. Encoded once, reused by the sidebar, the hero and the
       project cards. */
    const LOGO_MASK =
      'data:image/png;base64,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';

    function Starburst({ size = 24, className, style }) {
      const mask = `url(${LOGO_MASK})`;
      return h('span', {
        className,
        'aria-hidden': 'true',
        style: {
          display: 'inline-block',
          width: size,
          height: size,
          flex: 'none',
          pointerEvents: 'none',
          backgroundColor: 'var(--claude-look-accent, #D97757)',
          WebkitMaskImage: mask,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: mask,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          ...style
        }
      });
    }

    function BrandMark({ size = 24 }) {
      return h(Starburst, { size: size || 24 });
    }

    function HeroMark({ size = 40, className }) {
      return h(Starburst, { size: size || 40, className });
    }

    /* Claude icon font (Anthropicons, embedded above). Codes were read from the
       Claude icon catalog: E073 folder, E031 chat bubble, E066 search, E001
       plus, E027 chevron, E019 clip, E017 copy, E024 calendar. */
    function IconGlyph({ code, size = 18, className }) {
      return h(
        'span',
        {
          className,
          'aria-hidden': 'true',
          style: {
            fontFamily: "'claude-icons'",
            fontSize: size,
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontVariantLigatures: 'none',
            fontFeatureSettings: '"liga" 0'
          }
        },
        String.fromCodePoint(code)
      );
    }

    /* Sidebar entries always draw at one optical size (18px): DSH asks the
       panel-icon factory for 16px in the wide rail, which made the Claude
       glyphs read smaller and lighter than the shipped icons next to them. */
    const NAV_ICON_SIZE = 18;

    function FolderGlyph() {
      return h(IconGlyph, { code: 0xe0c9, size: NAV_ICON_SIZE });
    }

    function ChatGlyph() {
      return h(IconGlyph, { code: 0xe031, size: NAV_ICON_SIZE });
    }

    function PlusGlyph({ size = 14 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' }
        },
        h('line', { x1: 8, y1: 3.2, x2: 8, y2: 12.8 }),
        h('line', { x1: 3.2, y1: 8, x2: 12.8, y2: 8 })
      );
    }

    function ChevronGlyph({ size = 14 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' }
        },
        h('path', { d: 'M6.2 3.8 10.4 8l-4.2 4.2' })
      );
    }

    /* Additional Claude-style line icons (16px, 1.5 stroke, round caps).
       Ready for the sidebar sections and panels. */
    function svg(size, props, children) {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block' },
          ...props
        },
        children
      );
    }

    function SearchGlyph() {
      /* E0D3 · Claude's magnifier, so the search entry matches the rest of the
         Anthropicons set instead of a hand-drawn SVG that read lighter. */
      return h(IconGlyph, { code: 0xe0d3, size: NAV_ICON_SIZE });
    }

    function ClockGlyph({ size = 16 }) {
      return svg(size, null, [
        h('circle', { key: 'c', cx: 8, cy: 8, r: 5.6 }),
        h('path', { key: 'p', d: 'M8 4.8V8l2.4 1.4' })
      ]);
    }

    function LayersGlyph({ size = 16 }) {
      return svg(size, null, [
        h('path', { key: 'a', d: 'M8 3 13 5.5 8 8 3 5.5Z' }),
        h('path', { key: 'b', d: 'M8 8 13 10.5 8 13 3 10.5Z' })
      ]);
    }

    function CalendarGlyph({ size = 16 }) {
      return svg(size, null, [
        h('rect', { key: 'r', x: 2.4, y: 3.2, width: 11.2, height: 9.6, rx: 1.6 }),
        h('line', { key: 'a', x1: 2.4, y1: 6.8, x2: 13.6, y2: 6.8 }),
        h('line', { key: 'b', x1: 5.4, y1: 1.8, x2: 5.4, y2: 4.6 }),
        h('line', { key: 'c', x1: 10.6, y1: 1.8, x2: 10.6, y2: 4.6 })
      ]);
    }

    function SendGlyph({ size = 16 }) {
      return svg(size, null, [
        h('line', { key: 'a', x1: 8, y1: 11, x2: 8, y2: 4 }),
        h('path', { key: 'b', d: 'M4.6 7.4 8 4l3.4 3.4' })
      ]);
    }

    function ChevronDownGlyph({ size = 16 }) {
      return svg(size, null, [h('path', { key: 'p', d: 'M4 6l4 4 4-4' })]);
    }

    function DotsGlyph({ size = 16 }) {
      return svg(size, null, [
        h('circle', { key: 'a', cx: 3.6, cy: 8, r: 1.15, fill: 'currentColor', stroke: 'none' }),
        h('circle', { key: 'b', cx: 8, cy: 8, r: 1.15, fill: 'currentColor', stroke: 'none' }),
        h('circle', { key: 'c', cx: 12.4, cy: 8, r: 1.15, fill: 'currentColor', stroke: 'none' })
      ]);
    }

    function CheckGlyph({ size = 16 }) {
      return svg(size, null, [h('path', { key: 'p', d: 'M3.2 8.6 6.4 11.8 12.8 4.4' })]);
    }

    /* ------------------------------------------------------------------ */
    /* Dictionaries                                                        */
    /* ------------------------------------------------------------------ */

    const DICTS = {
      en: {
        'nav.chats': 'Chats',
        'crumbs.menu': 'Chat actions',
        'crumbs.rename': 'Chat title',
        'crumbs.untitled': 'Untitled',
        'nav.projects': 'Projects',
        'note.disclaimer': 'The assistant can make mistakes. Please double-check responses.',
        'projects.title': 'Projects',
        'projects.intro': 'Working folders the assistant treats as context.',
        'projects.new': 'New project',
        'projects.open': 'Open',
        'projects.chatCount': 'Chats',
        'projects.created': 'Created',
        'projects.empty.title': 'No projects yet',
        'projects.empty.body': 'Pick a folder and the assistant will work with its files.',
        'projects.empty.action': 'Choose a folder',
        'projects.busy': 'Opening…',
        'projects.failed': 'Could not create the project.',
        'projects.unavailable': 'Workspaces are not available in this build.'
      },
      ru: {
        'nav.chats': 'Чаты',
        'crumbs.menu': 'Действия с чатом',
        'crumbs.rename': 'Название чата',
        'crumbs.untitled': 'Без названия',
        'nav.projects': 'Проекты',
        'note.disclaimer': 'Ассистент может ошибаться. Проверяйте важные ответы.',
        'projects.title': 'Проекты',
        'projects.intro': 'Рабочие папки, которые ассистент видит как контекст.',
        'projects.new': 'Новый проект',
        'projects.open': 'Открыть',
        'projects.chatCount': 'Чатов',
        'projects.created': 'Создан',
        'projects.empty.title': 'Пока нет проектов',
        'projects.empty.body': 'Выберите папку — ассистент будет работать с её файлами.',
        'projects.empty.action': 'Выбрать папку',
        'projects.busy': 'Открываю…',
        'projects.failed': 'Не удалось создать проект.',
        'projects.unavailable': 'Рабочие пространства недоступны в этой сборке.'
      },
      zh: {
        'nav.chats': '会话',
        'crumbs.menu': '会话操作',
        'crumbs.rename': '会话标题',
        'crumbs.untitled': '未命名',
        'nav.projects': '项目',
        'note.disclaimer': '助手可能会出错，请核实重要信息。',
        'projects.title': '项目',
        'projects.intro': '作为上下文的工作文件夹。',
        'projects.new': '新建项目',
        'projects.open': '打开',
        'projects.chatCount': '会话',
        'projects.created': '创建于',
        'projects.empty.title': '还没有项目',
        'projects.empty.body': '选择一个文件夹，助手将基于其中的文件工作。',
        'projects.empty.action': '选择文件夹',
        'projects.busy': '正在打开…',
        'projects.failed': '无法创建项目。',
        'projects.unavailable': '当前版本不支持工作区。'
      }
    };

    /* ------------------------------------------------------------------ */
    /* Styles                                                              */
    /* ------------------------------------------------------------------ */

    const CSS = `
@font-face{font-family:'claude-icons';font-style:normal;font-display:block;font-weight:400;src:url(data:font/woff2;base64,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) format('woff2')}
:root {
  --dsw-font-family-brand: "New York", "Iowan Old Style", "Charter", "Palatino Linotype", Georgia, "Times New Roman", serif !important;
}
::selection {
  background: rgba(217, 119, 87, 0.24);
}
[data-ds-dark-theme] ::selection {
  background: rgba(217, 119, 87, 0.34);
}
/* macOS renders the sidebar as a translucent blue-glass column; a Claude
   sidebar is a solid warm panel, so the vibrancy layer is replaced. The
   selector matches the shell's generated class suffix and degrades to the
   shipped appearance if that suffix ever changes. */
[data-platform="darwin"] [class*="_sidebarCol"] {
  background: var(--dsw-specific-sidebar-fill) !important;
  border-right: 0.5px solid var(--dsw-alias-border-l2) !important;
}
[data-platform="darwin"] [data-ds-dark-theme] [class*="_sidebarCol"] {
  background: var(--dsw-specific-sidebar-fill) !important;
  border-right: 0.5px solid var(--dsw-alias-border-l2) !important;
}
.clx-root, .clx-root * {
  box-sizing: border-box;
}
.clx-page {
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  padding: 0 clamp(24px, 4vw, 48px) 48px;
  overflow: auto;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
}
.clx-page > * {
  width: 100%;
  max-width: 960px;
}
.clx-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-top: 28px;
}
[data-platform="darwin"] .clx-head {
  padding-top: calc(28px + var(--dsh-frame-top-clearance, 0px));
}
.clx-headText {
  min-width: 0;
  max-width: 100%;
}
.clx-title {
  margin: 0;
  font-family: var(--dsw-font-family-brand);
  font-size: 28px;
  font-weight: 500;
  line-height: 34px;
  letter-spacing: -0.012em;
}
.clx-intro {
  margin: 4px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
}
.clx-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  padding: 0 13px;
  border: 0.5px solid var(--dsw-alias-border-l3);
  border-radius: var(--dsw-radius-md);
  background: var(--dsw-alias-button-elevated-fill);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  cursor: pointer;
  white-space: nowrap;
}
.clx-primary:hover:not(:disabled) {
  background: var(--dsw-alias-button-floating-hover);
}
.clx-primary:disabled {
  opacity: 0.6;
  cursor: default;
}
.clx-primary:focus-visible,
.clx-card:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary);
  outline-offset: 2px;
}
.clx-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(258px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.clx-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 16px 18px 14px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-xl);
  background: var(--dsw-alias-bg-layer-1);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.14s var(--ds-ease-in-out), border-color 0.14s var(--ds-ease-in-out);
}
.clx-card:hover {
  background: var(--dsw-alias-bg-layer-2);
  border-color: var(--dsw-alias-border-l3);
}
.clx-cardTop {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.clx-cardTitle {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}
.clx-cardPath {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-tertiary);
  font-family: var(--ds-font-family-code);
  font-size: 11px;
  line-height: 16px;
}
.clx-cardFoot {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dsw-alias-label-caption);
  font-size: 12px;
  line-height: 18px;
}
.clx-cardMeta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.clx-cardOpen {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--dsw-alias-label-secondary);
  opacity: 0;
  transition: opacity 0.14s var(--ds-ease-in-out);
}
.clx-card:hover .clx-cardOpen,
.clx-card:focus-visible .clx-cardOpen {
  opacity: 1;
}
.clx-emptyWrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0 64px;
}
.clx-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 420px;
  padding: 28px;
  text-align: center;
}
.clx-emptyTitle {
  margin: 4px 0 0;
  font-family: var(--dsw-font-family-brand);
  font-size: 22px;
  font-weight: 500;
  line-height: 28px;
}
.clx-emptyBody {
  margin: 0 0 8px;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
}
.clx-error {
  margin: 0;
  color: var(--dsw-alias-state-error-primary);
  font-size: 12px;
  line-height: 18px;
}

/* "Harness" settings section */
.clx-harness {
  padding: 24px 32px;
}
.clx-harnessTitle {
  margin: 0 0 12px;
  font-family: var(--dsw-font-family-brand);
  font-size: 22px;
  font-weight: 500;
  line-height: 28px;
}
.clx-harnessText {
  margin: 0 0 8px;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
}

/* "Search" page */
.clx-search {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 14px;
}
.clx-search:focus {
  outline: 2px solid var(--dsw-alias-state-business-primary);
  outline-offset: 1px;
}
.clx-list {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.clx-listRow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--dsw-alias-label-primary);
}
.clx-listRow:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.clx-listLabel {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

/* --- Claude look: hero + composer surface -------------------------- */
/* Serif greeting headline (the hero title), like Claude's serif display.
   The class hash is stable for this build; if a DSH update renames it the
   rule simply stops applying and the headline returns to the default sans. */
._8tPydW_headline {
  font-family: var(--dsw-font-family-brand);
  font-weight: 400;
  font-size: 30px;
  line-height: 38px;
  letter-spacing: -0.012em;
}
/* Claude's composer card: generous corners, one hairline outline and a soft
   lift. The corner is sized against the send circle so the pair reads like the
   reference (which keeps a smaller button in a rounder card). */
[data-composer-card] {
  border-radius: 26px !important;
  border: 1px solid var(--dsw-alias-border-l2) !important;
  box-shadow: 0 10px 30px rgba(31, 30, 29, 0.06) !important;
  /* Claude's send button is terracotta (#C66141 measured). */
  --dsw-alias-button-info-fill: #C66141;
  --dsw-alias-button-info-hover: #B0553A;
}
/* The send control is a smaller circle in Claude, not a 34px rounded square. */
[data-composer-card] [class*="_primary"] {
  width: 30px !important;
  height: 30px !important;
  border-radius: 999px !important;
}
/* The dictation trigger steps down with it. */
[data-composer-card] [class*="pn0E2q_trigger"] {
  width: 24px !important;
}
[data-composer-card] [class*="pn0E2q_trigger"] svg {
  width: 16px;
  height: 16px;
}
/* The add control is a bare plus on the card: no filled circle behind it. */
[data-composer-card] [class*="_add"] {
  background: transparent !important;
}
[data-composer-card] [class*="_add"]:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover) !important;
}
/* The access-permission line is quiet gray text: the shipped glyph is dropped
   and the label steps down to the tertiary tone. */
[data-composer-card] [class~="SJRB_q_triggerIcon"] {
  display: none !important;
}
[data-composer-card] [class~="SJRB_q_trigger"] {
  height: 28px;
  padding: 0 8px !important;
  border-radius: 999px !important;
  color: var(--dsw-alias-label-tertiary) !important;
  font-weight: 400;
}
/* Same wash as the model picker: both controls share one hover treatment. */
[data-composer-card] [class~="SJRB_q_trigger"]:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover) !important;
}
/* The model picker is plain text at rest (the pill in the reference was its
   hover state): name + muted effort, with a rounded wash on hover and no
   chevron. Exact class tokens — a substring match also hits the inner
   triggerLabel/triggerEffort spans and paints them as separate pills. */
[data-composer-card] [class~="htuFrW_trigger"] {
  height: 28px;
  padding: 0 8px !important;
  border-radius: 999px !important;
  background: transparent !important;
  color: var(--dsw-alias-label-primary) !important;
  gap: 6px !important;
}
[data-composer-card] [class~="htuFrW_trigger"]:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover) !important;
}
[data-composer-card] [class~="htuFrW_triggerEffort"] {
  padding: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: var(--dsw-alias-label-tertiary) !important;
}
/* Claude shows the model as plain text, so the dropdown chevron goes away. */
[data-composer-card] [class~="htuFrW_chevron"] {
  display: none !important;
}

/* Claude icon substitutions for the most visible chrome controls. DSH renders
   its icons as inline SVGs (not slots), so hide the glyph and draw the Claude
   one from the embedded icon font. */
[data-composer-card] [class*="_add"] svg,
[class~="kB3qhq_newSession"] svg {
  display: none;
}
[data-composer-card] [class*="_add"]::before,
[class~="kB3qhq_newSession"]::before {
  content: '\\e001';
  font-family: 'claude-icons';
  font-size: 18px;
  line-height: 1;
}

/* Composer action button. The shipped button swaps its inline icon by state:
   a path arrow while it sends, a rounded square (rect) while it stops, and a
   circle+path spinner while a request is in flight. Only the send state is
   redrawn with Claude's up arrow — the stop square and the spinner must stay
   visible, otherwise stopping a generation has no affordance. */
[data-composer-card] [class*="_primary"]:not(:has(svg rect)):not(:has(svg circle)) svg {
  display: none;
}
[data-composer-card] [class*="_primary"]:not(:has(svg rect)):not(:has(svg circle))::before {
  content: '\\e013';
  font-family: 'claude-icons';
  font-size: 18px;
  line-height: 1;
}

/* Claude keeps search in the sidebar menu; hide DSH's duplicate workspace
   search button in the workspaces header. */
[class*="_searchButton"] {
  display: none !important;
}

/* Claude keeps Markdown headings in the body sans (bold), so no serif
   override here. The transcript body is data-conversation-content. */

/* Claude's header divider and the column divider read as one pair: same colour,
   the header line one step heavier (1px) than the column's 0.5px hairline.
   Measured against the reference: header ~#E1 at 1px, column ~#E4 at 0.5px;
   the l1 token (0.06 alpha) rendered the header line almost invisible. The
   :has() selector targets the header without a hashed class. */
:has(> [data-conversation-header-leading]) {
  border-bottom: 1px solid var(--dsw-alias-border-l2) !important;
}

/* Claude's sidebar wordmark uses the serif display face (like the Claude
   logotype). Falls back gracefully if the class hash changes. */
[class*="_brandName"] {
  font-family: var(--dsw-font-family-brand);
  letter-spacing: 0;
}

/* Hide DSH's "preview build" badge next to the hero heading; the status moves
   to Settings. */
._8tPydW_previewBadge {
  display: none !important;
}

/* Uniform zoom like Claude: scale the whole app by the factor the conversation
   text grows. The text size itself is pinned to its 14px base globally so the
   derived Markdown sizes recompute and are not scaled twice; --claude-zoom is
   computed by the client half from the user's inline font-size setting. */
body {
  --dsh-content-font-size: 14px !important;
  zoom: var(--claude-zoom, 1);
}

/* --- Claude look: settings dialog ------------------------------------ */

/* Claude's Settings is a white sheet with outlined blocks, not a tinted panel
   with filled cards. The shell paints itself with bg-layer-2 and its cards with
   the settings-card tokens, so both are re-pointed on the panel scope. */
[class*="_77Pn0W_panel"] {
  background: var(--dsw-alias-bg-base, #FFFFFF) !important;
  --dsw-alias-settings-card-fill: var(--dsw-alias-bg-base, #FFFFFF);
  --dsw-alias-settings-card-stroke: var(--dsw-alias-border-l2);
}

/* --- Claude look: header breadcrumb --------------------------------- */

/* Claude's header reads "Project / Chat (chevron)". The shipped header renders
   only the bare session title in nav.crumbs, so that row is hidden and this
   plugin draws the breadcrumb through the title-row actions slot; the actions
   cell then takes the row, which keeps DSH's own indicators on the right. */
[class*="_crumbs"] {
  display: none !important;
}
[class*="_headerActions"] {
  margin-left: 0 !important;
  flex: 1 1 auto !important;
  min-width: 0;
}
/* The title cluster clips to its padding box and carries a -4px left margin, so
   the project pill's hover background was cut on the left. Widen the clip box
   by the same amount the pill overhangs, keeping the content at the same x. */
[class*="_titleCluster"] {
  margin-left: -10px !important;
  padding-left: 10px !important;
}
.clx-crumbs {
  display: flex;
  align-items: center;
  gap: 0;
  min-width: 0;
  flex: 1 1 auto;
}
.clx-crumbsProject {
  max-width: 40%;
  margin-left: -8px;
  padding: 4px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font: inherit;
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
.clx-crumbsProject:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
/* Claude keeps equal space around the slash: the pill's own 8px right padding
   plus 10px here on the left, 10px plus the title's 8px padding on the right. */
.clx-crumbsSep {
  margin: 0 10px;
  color: var(--dsw-alias-label-caption);
  font-size: 14px;
  line-height: 20px;
}
.clx-crumbsTitle {
  min-width: 0;
  margin-left: 0;
  padding: 4px 8px;
  border-radius: 8px;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: text;
}
.clx-crumbsTitle:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.clx-crumbsInput {
  min-width: 96px;
  max-width: 420px;
  margin-left: 0;
  padding: 3px 7px;
  border: 1px solid var(--dsw-alias-state-business-primary, #2563EB);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, #FFFFFF);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  outline: none;
}
/* The session menu trigger: the shipped ellipsis button redrawn as Claude's
   chevron, so the trigger reads as the breadcrumb's dropdown. */
.clx-crumbMenu {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 10px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.clx-crumbMenu:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.clx-crumbMenu > svg {
  display: none;
}
.clx-crumbMenu::before {
  content: '\\e027';
  font-family: 'claude-icons';
  font-size: 16px;
  line-height: 1;
}
/* Claude's "Создать" is the first menu item, not a filled pill: no background
   at rest, the same hover wash and radius as a navigation row. The row itself
   carries a 4px inset margin that navigation rows do not have, so the button's
   left padding is 4px smaller and the plus and label land on the same columns
   as the other entries (measured from a screenshot: content sat 3.7px right). */
[class~="kB3qhq_newSession"] {
  background: transparent !important;
  border-color: transparent !important;
  flex: 1 1 auto;
  border-radius: var(--dsw-radius-md, 8px);
  height: 32px !important;
  padding: 0 10px 0 7px !important;
  justify-content: flex-start !important;
  font-weight: 400;
}
[class~="kB3qhq_newSession"]:hover {
  background: var(--dsw-alias-interactive-bg-hover) !important;
}
[class~="kB3qhq_newSession"]::before {
  font-size: 18px;
  margin-right: 11px;
}

/* The label follows the plus at the left; DSH centres it across the whole pill
   because the mask spans the remaining width. */
[class~="kB3qhq_newSessionLabelMask"] {
  flex: 0 1 auto !important;
  min-width: 0;
}
[class~="kB3qhq_newSessionContent"] {
  width: auto !important;
  justify-content: flex-start !important;
}

/* Claude names the action "Создать" and never shows the keyboard hint; DSH's
   own locale string is longer and reveals its shortcut on hover. The label is
   dropped from layout and the word re-created on the content row, so the text
   keeps a normal line box (hiding it with font-size:0 left a 0-size strut that
   lifted the baseline ~2px off the plus). */
[class~="kB3qhq_newSessionLabel"] {
  display: none !important;
}
[class~="kB3qhq_newSessionContent"]::after {
  content: 'Создать';
  font-size: 14px;
  line-height: 22px;
}
[class~="kB3qhq_newSessionShortcut"] {
  display: none !important;
}

/* DSH puts 6px between a nav icon and its label, which leaves every nav label
   16px (6px CSS) left of the Create label; Claude lines both up on one edge.
   Widen the gap so the list and the pill share the same text column. */
[class~="kB3qhq_root"] {
  --dsh-sidebar-label-gap: 12px !important;
}

/* Claude draws every sidebar icon from one set, so the entries DSH ships with
   its own glyphs are redrawn from Anthropicons at the same optical size as our
   entries: plug (Плагины), clock (Задачи автоматизации), app grid (Ещё). The
   icons are selected by the row's aria-label because the rows themselves
   belong to the shipped packages. */
[class~="kB3qhq_panelRow"] > [class~="kB3qhq_panelGlyph"]::before {
  font-family: 'claude-icons';
  font-size: 18px;
  line-height: 1;
  font-variant-ligatures: none;
}
[class~="kB3qhq_panelRow"][aria-label="Плагины"] > [class~="kB3qhq_panelGlyph"]::before,
[class~="kB3qhq_panelRow"][aria-label="Plugins"] > [class~="kB3qhq_panelGlyph"]::before {
  content: '\\e0c5';
}
[class~="kB3qhq_panelRow"][aria-label="Задачи автоматизации"] > [class~="kB3qhq_panelGlyph"]::before,
[class~="kB3qhq_panelRow"][aria-label="Scheduled tasks"] > [class~="kB3qhq_panelGlyph"]::before {
  content: '\\e043';
}
[class~="kB3qhq_panelRow"][aria-label="Ещё"] > [class~="kB3qhq_panelGlyph"]::before,
[class~="kB3qhq_panelRow"][aria-label="More"] > [class~="kB3qhq_panelGlyph"]::before,
[class~="kB3qhq_panelRow"][aria-haspopup="menu"] > [class~="kB3qhq_panelGlyph"]::before {
  content: '\\e055';
}
/* The shipped glyph sits inside the slot's own wrapper, so hide any svg under
   the glyph cell (the row's unpin button lives outside it). */
[class~="kB3qhq_panelRow"][aria-label="Плагины"] [class~="kB3qhq_panelGlyph"] svg,
[class~="kB3qhq_panelRow"][aria-label="Plugins"] [class~="kB3qhq_panelGlyph"] svg,
[class~="kB3qhq_panelRow"][aria-label="Задачи автоматизации"] [class~="kB3qhq_panelGlyph"] svg,
[class~="kB3qhq_panelRow"][aria-label="Scheduled tasks"] [class~="kB3qhq_panelGlyph"] svg,
[class~="kB3qhq_panelRow"][aria-label="Ещё"] [class~="kB3qhq_panelGlyph"] svg,
[class~="kB3qhq_panelRow"][aria-label="More"] [class~="kB3qhq_panelGlyph"] svg,
[class~="kB3qhq_panelRow"][aria-haspopup="menu"] [class~="kB3qhq_panelGlyph"] svg {
  display: none !important;
}
/* The slot wraps the shipped icon in its own element; drop that wrapper too so
   the replacement glyph is the only child of the 16px icon cell and stays
   optically centred. */
[class~="kB3qhq_panelRow"][aria-label="Плагины"] [class~="kB3qhq_panelGlyph"] > :has(svg),
[class~="kB3qhq_panelRow"][aria-label="Plugins"] [class~="kB3qhq_panelGlyph"] > :has(svg),
[class~="kB3qhq_panelRow"][aria-label="Задачи автоматизации"] [class~="kB3qhq_panelGlyph"] > :has(svg),
[class~="kB3qhq_panelRow"][aria-label="Scheduled tasks"] [class~="kB3qhq_panelGlyph"] > :has(svg),
[class~="kB3qhq_panelRow"][aria-label="Ещё"] [class~="kB3qhq_panelGlyph"] > :has(svg),
[class~="kB3qhq_panelRow"][aria-label="More"] [class~="kB3qhq_panelGlyph"] > :has(svg),
[class~="kB3qhq_panelRow"][aria-haspopup="menu"] [class~="kB3qhq_panelGlyph"] > :has(svg) {
  display: none !important;
}

/* Claude's collapse control is a rounded panel with a short dash near the left
   edge, not DSH's full-height divider. The shipped glyphs are hidden and the
   shape comes from one inline SVG mask, shared by the sidebar's own toggle and
   by the header's sidebar opener (shown while the sidebar is collapsed). */
:root {
  --clx-panel-mask: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2018%2018'%3E%3Crect%20x='1.4'%20y='2.85'%20width='15.2'%20height='12.3'%20rx='3.7'%20fill='none'%20stroke='black'%20stroke-width='1.3'/%3E%3Cpath%20d='M5.05%206.05v5.9'%20stroke='black'%20stroke-width='1.3'%20stroke-linecap='round'/%3E%3C/svg%3E");
}
[data-sidebar-toggle] > svg[class*="kB3qhq_panelIcon"] {
  display: none !important;
}
[data-sidebar-opener] > svg {
  display: none !important;
}
[class~="kB3qhq_root"]:not([class~="kB3qhq_collapsed"]) [data-sidebar-toggle]::before,
[class~="kB3qhq_collapsed"] [data-sidebar-toggle]:hover::before,
[data-sidebar-opener]::before {
  content: '';
  display: block;
  width: 18px;
  height: 18px;
  background: currentColor;
  -webkit-mask: var(--clx-panel-mask) center / contain no-repeat;
  mask: var(--clx-panel-mask) center / contain no-repeat;
}
/* Header trailing controls: the Session menu ("⋯") and the right-panel toggle
   in the header corner are redrawn from Claude's icon set. The panel glyph is
   the same mask as the sidebar toggle, mirrored, because this toggle points at
   the right column. */
[class*="_headerMenuButton"] svg,
[class*="_headerMenuButton"] > :has(svg),
[data-sidebar-right-expand] svg,
[data-sidebar-right-expand] > :has(svg) {
  display: none !important;
}
[class*="_headerMenuButton"]::before,
[data-sidebar-right-expand]::before {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-family: 'claude-icons';
  font-size: 16px;
  line-height: 1;
}
[class*="_headerMenuButton"]::before {
  content: '\\e061';
}
[data-sidebar-right-expand]::before {
  content: '';
  background: currentColor;
  -webkit-mask: var(--clx-panel-mask) center / contain no-repeat;
  mask: var(--clx-panel-mask) center / contain no-repeat;
  transform: scaleX(-1);
}

/* While the sidebar is collapsed the frame seats its controls in shell.leading
   (AppFrame's [data-shell-leading] seat): the reopen button plus a second one
   that starts a chat. Claude keeps a single opener there, so the extra button
   is dropped. */
[data-shell-leading] button:not([data-sidebar-opener]) {
  display: none !important;
}

/* The Create row is the first item of the same list, so its gap to the next
   row equals the navigation list gap (2px). */
[class~="kB3qhq_newSessionRow"] {
  margin-bottom: 2px !important;
}

/* Collapsed to the rail the button is a 36px icon square, so undo the wide
   alignment and the 32px row height there and keep the plus centred. */
[class~="kB3qhq_collapsed"] [class~="kB3qhq_newSession"] {
  height: 36px !important;
  padding: 0 !important;
  justify-content: center !important;
}
[class~="kB3qhq_collapsed"] [class~="kB3qhq_newSession"]::before {
  margin-right: 0;
}
[class~="kB3qhq_collapsed"] [class~="kB3qhq_newSessionContent"]::after {
  content: none;
}

/* The New-session row also hosts the DeepSeek chat-import upload button
   (sidebar.session.action occupant). Claude has one Create action, so drop
   every button in the row except New session itself. */
[class~="kB3qhq_newSessionRow"] button:not([class~="kB3qhq_newSession"]) {
  display: none !important;
}

/* DSH leaves 4px above the scroll region plus an 8px grid spacer row, which
   reads as a wide gap between the Create pill and the first nav row. Claude
   follows the pill directly, so drop both. */
[class~="kB3qhq_scrollRegion"] {
  margin-top: 0 !important;
}
[class~="kB3qhq_scrollArea"] {
  grid-template-rows: 0 max-content 2px max-content !important;
}

/* --- Claude look: workspaces section header ------------------------- */

/* Claude calls the section "Projects". The shipped label has max-width 45%,
   which clipped the longer Russian title, so the label takes the row instead
   and the word is re-drawn on it (the shipped string collapses to 0). */
[data-sidebar-workspace-header] [class*="_sectionLabel"] {
  flex: 1 1 auto !important;
  max-width: none !important;
  min-width: 0;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0 !important;
}
[data-sidebar-workspace-header] [class*="_sectionLabel"]::after {
  content: 'Проекты';
  font-size: 14px;
  line-height: 20px;
}
/* The header's two controls: shipped sliders and folder-plus are redrawn as
   Claude's gear (view options) and folder-plus (new project). */
[data-sidebar-workspace-header] [class*="_headerActions"] button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
[data-sidebar-workspace-header] [class*="_headerActions"] button > svg {
  display: none !important;
}
[data-sidebar-workspace-header] [class*="_headerActions"] button::before {
  font-family: 'claude-icons';
  font-size: 17px;
  line-height: 1;
}
[data-sidebar-workspace-header] [class*="_headerActions"] > button:first-child::before,
[data-sidebar-workspace-header] [class*="_headerActions"] > :first-child button::before {
  content: '\\e0d6';
}
[data-sidebar-workspace-header] [class*="_headerActions"] > button:last-child::before,
[data-sidebar-workspace-header] [class*="_headerActions"] > :last-child button::before {
  content: '\\e074';
}

/* --- Claude look: projects / workspaces block ----------------------- */

/* Claude marks a project with the archive-box glyph rather than a folder, and
   keeps the accent only on the open project. */
[class~="JoiKIa_folder"] > svg {
  display: none;
}
[class~="JoiKIa_folder"]::before {
  content: '\\e0c9';
  font-family: 'claude-icons';
  font-size: 17px;
  line-height: 1;
  color: var(--dsw-alias-label-primary);
}
[class~="JoiKIa_folderActive"]::before {
  color: #D97757;
}

/* Claude lines a project's chats up with the project title, so a chat row uses
   the plain base inset: no extra indent, and the workspace nesting indent is
   dropped. The hairline guide runs through the project icon's ink and is drawn
   per row with a 2px overshoot, so the 2px list gap does not dash it. */
[class~="JoiKIa_sessionRow"] {
  position: relative;
  padding-inline-start: calc(
    var(--dsh-sidebar-row-padding) - var(--dsh-sidebar-paint-inset)
  ) !important;
}
[class~="JoiKIa_sessionRow"]::before {
  content: '';
  position: absolute;
  top: -2px;
  bottom: -2px;
  left: calc(var(--dsh-sidebar-row-padding) + 4px);
  width: 1px;
  background: var(--dsw-alias-border-l2);
  pointer-events: none;
}

/* The status indicator (idle dot, or the running loader) moves from the leading
   slot to the right of the title, where Claude shows the timestamp; while it is
   there the timestamp is dropped. The slot leaves the flow, so the row keeps its
   title column by padding the vacated 16px back in. */
[class~="JoiKIa_sessionRow"] > [class~="JoiKIa_title"] {
  order: 1;
}
[class~="JoiKIa_sessionRow"] > [class~="JoiKIa_rowActions"] {
  order: 4;
}
[class~="JoiKIa_sessionRow"]:has(> [class~="JoiKIa_slot"] > *) {
  padding-inline-start: calc(
    var(--dsh-sidebar-row-padding) - var(--dsh-sidebar-paint-inset) + 16px
  ) !important;
}
[class~="JoiKIa_sessionRow"]:has(> [class~="JoiKIa_slot"] > *) > [class~="JoiKIa_slot"] {
  order: 2;
  width: auto;
  min-width: 10px;
  margin: 0 6px;
}
[class~="JoiKIa_sessionRow"] > [class~="JoiKIa_rowResting"] {
  order: 3;
}
[class~="JoiKIa_sessionRow"]:has(> [class~="JoiKIa_slot"] > *) [class~="JoiKIa_timestamp"] {
  display: none !important;
}

/* Claude's row keeps one "⋯" affordance: pin (100) and archive (600) live in
   that menu, not as extra icon buttons beside it. */
[class~="JoiKIa_rowQuickActions"] {
  display: none !important;
}

/* DSH's session hover card is a dark panel positioned in viewport coordinates;
   Claude shows a white bubble beside the row. The label tokens are re-pointed
   on the card itself so its own text stays readable on white. The position is
   corrected by the client half (the chrome zoom otherwise displaces it). */
body > span[class*="_portal_"] > div[class*="_card_"] {
  background: #FFFFFF !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 30px rgba(31, 30, 29, 0.14), 0 0 0 1px rgba(31, 30, 29, 0.06) !important;
  padding: 12px 14px !important;
  --dsw-alias-hovercard-label-primary: #1F1E1D;
  --dsw-alias-hovercard-label-secondary: #838077;
  --dsw-alias-hovercard-label-tertiary: #A7A399;
}
`;

    /* ------------------------------------------------------------------ */
    /* Projects panel                                                      */
    /* ------------------------------------------------------------------ */

    function formatDate(value) {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.valueOf())) return '';
      return date.toLocaleDateString();
    }

    function ProjectCard({ project, t, onOpen }) {
      const chats = Array.isArray(project.sessionIds) ? project.sessionIds.length : 0;
      const title = project.title || project.path || 'Project';
      return h(
        'li',
        { className: 'clx-cardItem' },
        h(
          'button',
          {
            type: 'button',
            className: 'clx-card',
            onClick: () => onOpen(project.workspaceId),
            title: project.path || title
          },
          h(
            'span',
            { className: 'clx-cardTop' },
            h(Starburst, { size: 18 }),
            h('span', { className: 'clx-cardTitle' }, title)
          ),
          project.path ? h('span', { className: 'clx-cardPath' }, project.path) : null,
          h(
            'span',
            { className: 'clx-cardFoot' },
            h('span', { className: 'clx-cardMeta' }, t('projects.chatCount') + ': ' + chats),
            project.createdAt
              ? h('span', { className: 'clx-cardMeta' }, t('projects.created') + ' ' + formatDate(project.createdAt))
              : null,
            h(
              'span',
              { className: 'clx-cardOpen' },
              h('span', null, t('projects.open')),
              h(ChevronGlyph, { size: 13 })
            )
          )
        )
      );
    }

    function ProjectsEmpty({ t, onCreate, busy, failed, unavailable }) {
      return h(
        'div',
        { className: 'clx-emptyWrap' },
        h(
          'div',
          { className: 'clx-empty' },
          h(Starburst, { size: 44 }),
          h('h2', { className: 'clx-emptyTitle' }, t('projects.empty.title')),
          h('p', { className: 'clx-emptyBody' }, unavailable ? t('projects.unavailable') : t('projects.empty.body')),
          onCreate
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'clx-primary',
                  disabled: busy,
                  onClick: onCreate
                },
                h(PlusGlyph, { size: 14 }),
                busy ? t('projects.busy') : t('projects.empty.action')
              )
            : null,
          failed ? h('p', { className: 'clx-error' }, failed) : null
        )
      );
    }

    function ProjectsView({ t, items, createProject, openProject, unavailable }) {
      const [busy, setBusy] = React.useState(false);
      const [failed, setFailed] = React.useState(null);

      const runCreate = async () => {
        if (typeof createProject !== 'function' || busy) return;
        setBusy(true);
        setFailed(null);
        try {
          await createProject();
        } catch (error) {
          console.error('[claude-look] project creation failed', error);
          setFailed(t('projects.failed'));
        } finally {
          setBusy(false);
        }
      };

      const hasItems = Array.isArray(items) && items.length > 0;
      return h(
        'div',
        { className: 'clx-page clx-root' },
        h(
          'header',
          { className: 'clx-head' },
          h(
            'div',
            { className: 'clx-headText' },
            h('h1', { className: 'clx-title' }, t('projects.title')),
            h('p', { className: 'clx-intro' }, t('projects.intro'))
          ),
          typeof createProject === 'function'
            ? h(
                'button',
                { type: 'button', className: 'clx-primary', disabled: busy, onClick: runCreate },
                h(PlusGlyph, { size: 14 }),
                busy ? t('projects.busy') : t('projects.new')
              )
            : null
        ),
        hasItems
          ? h(
              'ul',
              { className: 'clx-grid' },
              items.map((project) =>
                h(ProjectCard, {
                  key: project.workspaceId,
                  project,
                  t,
                  onOpen: openProject
                })
              )
            )
          : h(ProjectsEmpty, {
              t,
              unavailable: Boolean(unavailable),
              onCreate: typeof createProject === 'function' ? runCreate : null,
              busy,
              failed
            }),
        failed && hasItems ? h('p', { className: 'clx-error' }, failed) : null
      );
    }

    function ProjectsPanel(props) {
      if (typeof props.useWorkspaces !== 'function') {
        return h(ProjectsView, {
          t: props.t,
          items: [],
          unavailable: true,
          createProject: undefined,
          openProject: props.openProject
        });
      }
      return h(ProjectsWithData, props);
    }

    function ProjectsWithData(props) {
      const items = props.useWorkspaces((state) => (state && state.items) || []);
      return h(ProjectsView, {
        t: props.t,
        items,
        createProject: props.createProject,
        openProject: props.openProject
      });
    }

    /* "Harness" settings section: DSH-specific information and, later, the
       controls that differ from the Claude-style surface. */
    function HarnessSection() {
      return h(
        'div',
        { className: 'clx-harness' },
        h('h2', { className: 'clx-harnessTitle' }, 'Harness'),
        h(
          'p',
          { className: 'clx-harnessText' },
          'Сборка: предварительный просмотр (beta).'
        ),
        h(
          'p',
          { className: 'clx-harnessText' },
          'Здесь собраны специфичные настройки DeepSeek Harness. Пока это информационный раздел — переключатели появятся позже.'
        )
      );
    }

    /* "Search" page: a Claude-style global search over projects (workspaces). */
    function SearchView({ useWorkspaces, openWorkspace }) {
      const [query, setQuery] = React.useState('');
      const items = (useWorkspaces && useWorkspaces((state) => state.items)) || [];
      const needle = query.trim().toLowerCase();
      const results = needle
        ? items.filter((item) => String(item.label || '').toLowerCase().includes(needle))
        : items;
      return h(
        'div',
        { className: 'clx-page clx-root' },
        h('header', { className: 'clx-head' }, h('h1', { className: 'clx-title' }, 'Поиск')),
        h('input', {
          className: 'clx-search',
          type: 'search',
          placeholder: 'Поиск проектов',
          value: query,
          onChange: (event) => setQuery(event.target.value)
        }),
        h(
          'ul',
          { className: 'clx-list' },
          results.map((item) =>
            h(
              'li',
              {
                key: item.workspaceId,
                className: 'clx-listRow',
                onClick: () => openWorkspace && openWorkspace(item.workspaceId)
              },
              h(IconGlyph, { code: 0xe0c9, size: 16 }),
              h('span', { className: 'clx-listLabel' }, item.label || item.workspaceId)
            )
          )
        )
      );
    }

    /* ------------------------------------------------------------------ */
    /* Header breadcrumb                                                   */
    /* ------------------------------------------------------------------ */

    /* Stand-in hook used only when the slot owner does not hand one over, so
       the component calls the same number of hooks on every render. */
    const selectNothing = (selector) => selector(undefined);

    /* Claude's header reads "Project / Chat (chevron)": the project crumb opens
       the project, the title is click-to-rename text, and the chevron is the
       shipped Session menu trigger (pin, rename, archive, delete…). The
       registration supplies the localized `t`, `openProject`, the rename hop
       and the slot's own hooks. */
    function HeaderCrumbs(props) {
      const owner = props || {};
      const useSessions = typeof owner.useSessions === 'function' ? owner.useSessions : selectNothing;
      const useWorkspaces = typeof owner.useWorkspaces === 'function' ? owner.useWorkspaces : selectNothing;
      const t = typeof owner.t === 'function' ? owner.t : (key) => key;
      const sessionId = owner.sessionId;
      const session = useSessions((state) => (state && state.byId ? state.byId[sessionId] : undefined));
      const items = useWorkspaces((state) => (state && Array.isArray(state.items) ? state.items : []));
      const [editing, setEditing] = React.useState(false);
      const [draft, setDraft] = React.useState('');
      const inputRef = React.useRef(null);
      /* Enter commits and Escape cancels; both unmount the input, which can
         also fire blur. The flag keeps one edit from being applied twice or an
         escape from committing on blur. */
      const settledRef = React.useRef(false);
      React.useEffect(() => {
        if (!editing) return;
        const input = inputRef.current;
        if (input === null) return;
        input.focus();
        input.select();
      }, [editing]);
      if (sessionId === undefined) return null;
      const title =
        session && typeof session.title === 'string' && session.title !== ''
          ? session.title
          : t('crumbs.untitled');
      const project = (Array.isArray(items) ? items : []).find(
        (item) => Array.isArray(item.sessionIds) && item.sessionIds.indexOf(sessionId) !== -1
      );
      const projectLabel = project ? project.title || project.path || '' : '';

      const startRename = () => {
        settledRef.current = false;
        setDraft(title);
        setEditing(true);
      };
      const cancelRename = () => {
        settledRef.current = true;
        setEditing(false);
      };
      const commitRename = () => {
        if (settledRef.current) return;
        settledRef.current = true;
        const next = draft.trim();
        setEditing(false);
        if (next === '' || next === title) return;
        if (typeof owner.renameSession !== 'function') return;
        owner.renameSession(sessionId, next).catch((error) => {
          console.error('[claude-look] rename failed', error);
        });
      };

      const titleNode = editing
        ? h('input', {
            ref: inputRef,
            className: 'clx-crumbsInput',
            value: draft,
            'aria-label': t('crumbs.rename'),
            spellCheck: false,
            onChange: (event) => setDraft(event.target.value),
            onBlur: commitRename,
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitRename();
              } else if (event.key === 'Escape') {
                event.preventDefault();
                cancelRename();
              }
            }
          })
        : h(
            'span',
            {
              className: 'clx-crumbsTitle',
              role: 'button',
              tabIndex: 0,
              title,
              onClick: startRename,
              onKeyDown: (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                startRename();
              }
            },
            title
          );

      const menu =
        typeof owner.renderFactorySlot === 'function'
          ? owner.renderFactorySlot('contextMenu.button', {
              target: { kind: 'session', value: { sessionId, displayTitle: title } },
              label: t('crumbs.menu'),
              className: 'clx-crumbMenu'
            })
          : null;
      return h(
        'div',
        { className: 'clx-crumbs' },
        projectLabel
          ? h(
              'button',
              {
                type: 'button',
                className: 'clx-crumbsProject',
                title: projectLabel,
                onClick: () => {
                  if (project !== undefined && typeof owner.openProject === 'function') {
                    owner.openProject(project.workspaceId);
                  }
                }
              },
              projectLabel
            )
          : null,
        projectLabel ? h('span', { className: 'clx-crumbsSep', 'aria-hidden': 'true' }, '/') : null,
        titleNode,
        menu
      );
    }

    /* ------------------------------------------------------------------ */
    /* Client plugin                                                       */
    /* ------------------------------------------------------------------ */

    function apply(ctx) {
      /* Services arrive after this plugin boots, so the palette and the
         dictionaries are attached through ctx.inject instead of a one-shot
         ctx.get at apply time. */
      ctx.inject(['theme'], (scope) => {
        scope.effect(
          () => scope.theme.overrideTokens(SOURCE, TOKENS),
          'claude-look: Claude palette layer'
        );
      });

      /* Claude scales the whole UI, while DSH's Cmd+/- only changes the
         conversation text size. Derive a scale factor from that size and let
         the stylesheet scale the sidebar and header by it. */
      ctx.effect(() => {
        const body = document.body;
        const root = document.documentElement;
        if (
          !body ||
          !root ||
          typeof getComputedStyle !== 'function' ||
          typeof MutationObserver !== 'function'
        ) {
          return undefined;
        }
        const apply = () => {
          const raw = body.style.getPropertyValue('--dsh-content-font-size').trim();
          const size = parseFloat(raw);
          const ratio = Number.isFinite(size) && size > 0 ? size / 14 : 1;
          root.style.setProperty('--claude-zoom', String(ratio));
        };
        apply();
        const observer = new MutationObserver(apply);
        observer.observe(body, { attributes: true, attributeFilter: ['style', 'class'] });
        return () => {
          observer.disconnect();
          root.style.removeProperty('--claude-zoom');
        };
      }, 'claude-look: chrome zoom');

      /* The session hover card is a fixed-position panel that DSH places with
         viewport coordinates; the chrome zoom scales those coordinates a
         second time, so the card lands far from the row (Claude shows it right
         next to the hovered row). Re-place it from the hovered row's rect,
         dividing by the zoom because inline offsets live in the zoomed space. */
      ctx.effect(() => {
        const root = document.documentElement;
        const body = document.body;
        if (
          !root ||
          !body ||
          typeof MutationObserver !== 'function' ||
          typeof getComputedStyle !== 'function'
        ) {
          return undefined;
        }
        const CARD = 'body > span[class*="_portal_"] > div[class*="_card_"]';
        const ROW = '[class*="JoiKIa_sessionRow"]';
        const MENU = '[data-context-menu]';
        const MENU_TRIGGER = '[data-context-menu-trigger][aria-expanded="true"]';
        let anchor = null;
        let queued = false;

        const zoom = () => {
          const value = parseFloat(getComputedStyle(root).getPropertyValue('--claude-zoom'));
          return Number.isFinite(value) && value > 0 ? value : 1;
        };

        const place = () => {
          if (!(anchor instanceof HTMLElement) || !anchor.matches(':hover')) return;
          const card = document.querySelector(CARD);
          if (!(card instanceof HTMLElement)) return;
          const scale = zoom();
          const rect = anchor.getBoundingClientRect();
          const viewport = root.clientHeight * scale;
          const height = card.offsetHeight * scale;
          const gap = 8 * scale;
          let top = rect.top + rect.height / 2 - height / 2;
          top = Math.max(gap, Math.min(top, viewport - height - gap));
          const left = ((rect.right + gap) / scale).toFixed(2) + 'px';
          const nextTop = (top / scale).toFixed(2) + 'px';
          if (card.style.left !== left) card.style.left = left;
          if (card.style.top !== nextTop) card.style.top = nextTop;
        };

        /* The Session menu is anchored with CSS anchor positioning, which the
           chrome zoom displaces the same way as the hover card: the popover
           opens far from its chevron. Anchoring it by hand below the trigger,
           right-aligned, puts it back where Claude shows it. */
        const placeMenu = () => {
          const triggers = document.querySelectorAll(MENU_TRIGGER);
          const trigger = triggers.length > 0 ? triggers[triggers.length - 1] : null;
          if (!(trigger instanceof HTMLElement)) return;
          let menu = null;
          const candidates = document.querySelectorAll(MENU);
          for (const candidate of candidates) {
            if (!(candidate instanceof HTMLElement)) continue;
            if (candidate.offsetWidth === 0 || candidate.offsetHeight === 0) continue;
            menu = candidate;
          }
          if (menu === null) return;
          const scale = zoom();
          const rect = trigger.getBoundingClientRect();
          const width = menu.offsetWidth * scale;
          const height = menu.offsetHeight * scale;
          const viewportWidth = root.clientWidth * scale;
          const viewportHeight = root.clientHeight * scale;
          const margin = 8;
          let left = rect.right - width;
          left = Math.max(margin, Math.min(left, viewportWidth - width - margin));
          let top = rect.bottom + 6;
          if (top + height > viewportHeight - margin) {
            top = Math.max(margin, rect.top - 6 - height);
          }
          menu.style.setProperty('position', 'fixed', 'important');
          menu.style.setProperty('left', (left / scale).toFixed(2) + 'px', 'important');
          menu.style.setProperty('top', (top / scale).toFixed(2) + 'px', 'important');
          menu.style.setProperty('right', 'auto', 'important');
          menu.style.setProperty('bottom', 'auto', 'important');
        };

        /* DSH also re-places the card on scroll, in its own handler. Deferring a
           frame keeps our corrected offsets as the last write. */
        const schedule = () => {
          if (queued) return;
          queued = true;
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => {
              queued = false;
              place();
              placeMenu();
            });
          } else {
            queued = false;
            place();
            placeMenu();
          }
        };

        const onPointerOver = (event) => {
          const target = event.target;
          if (!(target instanceof Element)) return;
          const row = target.closest(ROW);
          anchor = row instanceof HTMLElement ? row : null;
        };

        const observer = new MutationObserver(schedule);
        observer.observe(body, { childList: true, subtree: true });
        const onOpenIntent = () => {
          schedule();
          if (typeof setTimeout === 'function') setTimeout(schedule, 0);
        };
        document.addEventListener('pointerover', onPointerOver, true);
        document.addEventListener('click', onOpenIntent, true);
        document.addEventListener('keydown', onOpenIntent, true);
        window.addEventListener('scroll', schedule, true);
        window.addEventListener('resize', schedule);
        return () => {
          observer.disconnect();
          document.removeEventListener('pointerover', onPointerOver, true);
          document.removeEventListener('click', onOpenIntent, true);
          document.removeEventListener('keydown', onOpenIntent, true);
          window.removeEventListener('scroll', schedule, true);
          window.removeEventListener('resize', schedule);
        };
      }, 'claude-look: hover card placement');

      ctx.inject(['locale'], (scope) => {
        for (const [language, dict] of Object.entries(DICTS)) {
          scope.effect(
            () => scope.locale.register(NS, language, dict),
            'claude-look: locale ' + language
          );
        }
      });

      const translate = (key) => {
        const locale = ctx.get('locale');
        if (locale && typeof locale.bind === 'function') {
          try {
            const value = locale.bind(NS)(key);
            if (typeof value === 'string' && value !== '' && value !== key) return value;
          } catch {
            /* fall through to the English dictionary */
          }
        }
        const dict = DICTS.en || {};
        return dict[key] || key;
      };

      ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.plugin = '@local/claude-look';
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => tag.remove();
      }, 'claude-look: global styles');

      const openProject = (workspaceId) => {
        const uiWorkspace = ctx.get('uiWorkspace');
        try {
          if (workspaceId && uiWorkspace && typeof uiWorkspace.openWorkspace === 'function') {
            const result = uiWorkspace.openWorkspace(workspaceId);
            if (result && typeof result.catch === 'function') {
              result.catch((error) => console.error('[claude-look] open project failed', error));
            }
          }
        } catch (error) {
          console.error('[claude-look] open project failed', error);
        }
      };

      const createProject = async () => {
        const uiWorkspace = ctx.get('uiWorkspace');
        const workspaces = ctx.get('workspaces');
        if (!uiWorkspace || typeof uiWorkspace.pickDirectory !== 'function') return;
        const path = await uiWorkspace.pickDirectory();
        if (!path) return;
        if (!workspaces || typeof workspaces.create !== 'function') return;
        const view = await workspaces.create({ path });
        const id = view && (view.workspaceId || view.id);
        if (id) openProject(id);
      };

      /* Explicit user title (the same hop the shipped rename dialog uses):
         sessions.using(...).binding.session.rename(title). */
      const renameSession = async (sessionId, title) => {
        const sessions = ctx.get('sessions');
        if (!sessions || typeof sessions.using !== 'function') {
          throw new Error('claude-look: sessions service unavailable');
        }
        const result = await sessions.using(sessionId, { source: 'workspaceOperation' }, (reference) =>
          reference.binding.session.rename(title)
        );
        if (result && result.ok === false) {
          throw new Error(result.error && result.error.message ? result.error.message : 'rename rejected');
        }
        return result;
      };

      const withTranslate = (props) => (key) => {
        if (props && typeof props.t === 'function') {
          try {
            const value = props.t(key);
            if (typeof value === 'string' && value !== '' && value !== key) return value;
          } catch {
            /* fall through to this package's own lookup */
          }
        }
        return translate(key);
      };

      const ProjectsEntry = (props) =>
        h(ProjectsPanel, {
          ...props,
          t: withTranslate(props),
          createProject,
          openProject
        });

      const chatsLabel = () => translate('nav.chats');
      const projectsLabel = () => translate('nav.projects');

      ctx.slots.inject('sidebar.brand.mark', () =>
        ctx.slots.register({ name: 'sidebar.brand.mark', priority: -1 }, BrandMark)
      );

      ctx.slots.inject('conversation.hero.brand.mark', () =>
        ctx.slots.register({ name: 'conversation.hero.brand.mark', priority: -1 }, HeroMark)
      );

      /* Claude's header breadcrumb: "Project / Chat (chevron)". Registered into
         the title-adjacent actions slot, which hands over sessionId, the
         session and workspace hooks, and the renderer for the Session menu
         trigger; the stylesheet hides the shipped bare-title crumbs. */
      ctx.slots.inject('conversation.session.header.actions', () =>
        ctx.slots.register(
          { name: 'conversation.session.header.actions', id: 'claude-look-crumbs', order: -100 },
          (props) => h(HeaderCrumbs, { ...props, t: withTranslate(props), openProject, renameSession })
        )
      );

      /* The composer footnote ("Ассистент может ошибаться…") is intentionally
         absent: conversation.composer.dock has no occupant from this plugin.
         The user removed it on purpose — do not restore. */

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: SOURCE,
            order: -10,
            label: projectsLabel,
            locale: NS
          },
          FolderGlyph
        )
      );

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: 'conversation',
            order: -20,
            label: chatsLabel,
            locale: NS
          },
          ChatGlyph
        )
      );

      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: SOURCE, locale: NS }, ProjectsEntry)
      );

      const SearchIcon = () => h(SearchGlyph, {});
      const SearchEntry = (props) => h(SearchView, { ...props, openWorkspace: openProject });

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: 'search', order: -30, label: 'Поиск', locale: NS },
          SearchIcon
        )
      );
      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: 'search', locale: NS }, SearchEntry)
      );

      ctx.slots.inject('settings.section', () =>
        ctx.slots.register(
          { name: 'settings.section', id: 'harness', order: 100, label: 'Harness', locale: NS },
          HarnessSection
        )
      );
    }

    return { inject: ['slots'], apply };
  }
});
