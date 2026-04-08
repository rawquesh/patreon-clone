# classes.ts

```ts
// ----------------------------------------------------------------------

export const editorClasses = {
  root: 'nml__editor__root',
  toolbar: {
    hr: 'nml__editor__toolbar__hr',
    root: 'nml__editor__toolbar__root',
    bold: 'nml__editor__toolbar__bold',
    code: 'nml__editor__toolbar__code',
    undo: 'nml__editor__toolbar__undo',
    redo: 'nml__editor__toolbar__redo',
    link: 'nml__editor__toolbar__link',
    clear: 'nml__editor__toolbar__clear',
    image: 'nml__editor__toolbar__image',
    italic: 'nml__editor__toolbar__italic',
    strike: 'nml__editor__toolbar__strike',
    hardbreak: 'nml__editor__toolbar__hardbreak',
    unsetlink: 'nml__editor__toolbar__unsetlink',
    codeBlock: 'nml__editor__toolbar__code__block',
    alignLeft: 'nml__editor__toolbar__align__left',
    fullscreen: 'nml__editor__toolbar__fullscreen',
    blockquote: 'nml__editor__toolbar__blockquote',
    bulletList: 'nml__editor__toolbar__bullet__list',
    alignRight: 'nml__editor__toolbar__align__right',
    orderedList: 'nml__editor__toolbar__ordered__list',
    alignCenter: 'nml__editor__toolbar__align__center',
    alignJustify: 'nml__editor__toolbar__align__justify',
  },
  content: {
    hr: 'nml__editor__content__hr',
    root: 'nml__editor__content__root',
    link: 'nml__editor__content__link',
    image: 'nml__editor__content__image',
    codeInline: 'nml__editor__content__code',
    heading: 'nml__editor__content__heading',
    listItem: 'nml__editor__content__listItem',
    codeBlock: 'nml__editor__content__code__block',
    blockquote: 'nml__editor__content__blockquote',
    langSelect: 'nml__editor__content__lang__select',
    placeholder: 'nml__editor__content__placeholder',
    bulletList: 'nml__editor__content__bullet__list',
    orderedList: 'nml__editor__content__ordered__list',
  },
};

```

# components/code-highlight-block.css

```css
pre {
  code[as='code'] {
    .hljs-comment {
      color: #999;
    }
    .hljs-tag {
      color: #b4b7b4;
    }
    .hljs-operator,
    .hljs-punctuation,
    .hljs-subst {
      color: #ccc;
    }
    .hljs-operator {
      opacity: 0.7;
    }
    .hljs-bullet,
    .hljs-deletion,
    .hljs-name,
    .hljs-selector-tag,
    .hljs-template-variable,
    .hljs-variable {
      color: #f2777a;
    }
    .hljs-attr,
    .hljs-link,
    .hljs-literal,
    .hljs-number,
    .hljs-symbol,
    .hljs-variable.constant_ {
      color: #f99157;
    }
    .hljs-class .hljs-title,
    .hljs-title,
    .hljs-title.class_ {
      color: #fc6;
    }
    .hljs-strong {
      font-weight: 700;
      color: #fc6;
    }
    .hljs-addition,
    .hljs-code,
    .hljs-string,
    .hljs-title.class_.inherited__ {
      color: #9c9;
    }
    .hljs-built_in,
    .hljs-doctag,
    .hljs-keyword.hljs-atrule,
    .hljs-quote,
    .hljs-regexp {
      color: #6cc;
    }
    .hljs-attribute,
    .hljs-function .hljs-title,
    .hljs-section,
    .hljs-title.function_,
    .ruby .hljs-property {
      color: #69c;
    }
    .diff .hljs-meta,
    .hljs-keyword,
    .hljs-template-tag,
    .hljs-type {
      color: #c9c;
    }
    .hljs-emphasis {
      color: #c9c;
      font-style: italic;
    }
    .hljs-meta,
    .hljs-meta .hljs-keyword,
    .hljs-meta .hljs-string {
      color: #a3685a;
    }
    .hljs-meta .hljs-keyword,
    .hljs-meta-keyword {
      font-weight: 700;
    }
  }
}

```

# components/code-highlight-block.tsx

```tsx
import './code-highlight-block.css';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

import { editorClasses } from '../classes';

import type { EditorCodeHighlightBlockProps } from '../types';

// ----------------------------------------------------------------------

export function CodeHighlightBlock({
  node: {
    attrs: { language: defaultLanguage },
  },
  extension,
  updateAttributes,
}: EditorCodeHighlightBlockProps) {
  return (
    <NodeViewWrapper className={editorClasses.content.codeBlock}>
      <select
        name="language"
        contentEditable={false}
        defaultValue={defaultLanguage}
        onChange={(event) => updateAttributes({ language: event.target.value })}
        className={editorClasses.content.langSelect}
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {extension.options.lowlight.listLanguages().map((lang: string) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}

```

# components/heading-block.tsx

```tsx
import { useState } from 'react';

import Menu from '@mui/material/Menu';
import { listClasses } from '@mui/material/List';
import ButtonBase, { buttonBaseClasses } from '@mui/material/ButtonBase';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from '../../iconify';
import { ToolbarItem } from './toolbar-item';

import type { EditorToolbarProps } from '../types';

// ----------------------------------------------------------------------

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const HEADING_OPTIONS = [
  'Heading 1',
  'Heading 2',
  'Heading 3',
  'Heading 4',
  'Heading 5',
  'Heading 6',
];

export function HeadingBlock({ editor }: Pick<EditorToolbarProps, 'editor'>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!editor) {
    return null;
  }

  return (
    <>
      <ButtonBase
        id="heading-menu-button"
        aria-label="Heading menu button"
        aria-controls={anchorEl ? 'heading-menu-button' : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? 'true' : undefined}
        onClick={handleClick}
        sx={{
          px: 1,
          width: 120,
          height: 32,
          borderRadius: 0.75,
          typography: 'body2',
          justifyContent: 'space-between',
          border: (theme) => `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
        }}
      >
        {(editor.isActive('heading', { level: 1 }) && 'Heading 1') ||
          (editor.isActive('heading', { level: 2 }) && 'Heading 2') ||
          (editor.isActive('heading', { level: 3 }) && 'Heading 3') ||
          (editor.isActive('heading', { level: 4 }) && 'Heading 4') ||
          (editor.isActive('heading', { level: 5 }) && 'Heading 5') ||
          (editor.isActive('heading', { level: 6 }) && 'Heading 6') ||
          'Paragraph'}

        <Iconify
          width={16}
          icon={anchorEl ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
        />
      </ButtonBase>

      <Menu
        id="heading-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'heading-button' }}
        slotProps={{
          paper: {
            sx: {
              width: 120,
              [`& .${listClasses.root}`]: { gap: 0.5, display: 'flex', flexDirection: 'column' },
              [`& .${buttonBaseClasses.root}`]: {
                px: 1,
                width: 1,
                height: 34,
                borderRadius: 0.75,
                justifyContent: 'flex-start',
                '&:hover': { backgroundColor: 'action.hover' },
              },
            },
          },
        }}
      >
        <ToolbarItem
          component="li"
          label="Paragraph"
          active={editor.isActive('paragraph')}
          onClick={() => {
            handleClose();
            editor.chain().focus().setParagraph().run();
          }}
        />

        {HEADING_OPTIONS.map((heading, index) => {
          const level = (index + 1) as HeadingLevel;

          return (
            <ToolbarItem
              aria-label={heading}
              component="li"
              key={heading}
              label={heading}
              active={editor.isActive('heading', { level })}
              onClick={() => {
                handleClose();
                editor.chain().focus().toggleHeading({ level }).run();
              }}
              sx={{
                ...(heading !== 'Paragraph' && {
                  fontSize: 18 - index,
                  fontWeight: 'fontWeightBold',
                }),
              }}
            />
          );
        })}
      </Menu>
    </>
  );
}

```

# components/image-block.tsx

```tsx
import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { editorClasses } from '../classes';
import { ToolbarItem } from './toolbar-item';

import type { EditorToolbarProps } from '../types';

// ----------------------------------------------------------------------

export function ImageBlock({ editor }: Pick<EditorToolbarProps, 'editor'>) {
  const [url, setUrl] = useState('');

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleUpdateUrl = useCallback(() => {
    handleClosePopover();

    if (anchorEl) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [anchorEl, editor, url]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <ToolbarItem
        aria-label="Image"
        className={editorClasses.toolbar.image}
        onClick={handleOpenPopover}
        icon={
          <path d="M20 5H4V19L13.2923 9.70649C13.6828 9.31595 14.3159 9.31591 14.7065 9.70641L20 15.0104V5ZM2 3.9934C2 3.44476 2.45531 3 2.9918 3H21.0082C21.556 3 22 3.44495 22 3.9934V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V3.9934ZM8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9C10 10.1046 9.10457 11 8 11Z" />
        }
      />

      <Popover
        id={anchorEl ? 'simple-popover' : undefined}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2.5 } } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          URL
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <TextField
            size="small"
            placeholder="Enter URL here..."
            value={url}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUrl(event.target.value);
            }}
            sx={{ width: 240 }}
          />
          <Button variant="contained" onClick={handleUpdateUrl}>
            Apply
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

```

# components/link-block.tsx

```tsx
import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { editorClasses } from '../classes';
import { ToolbarItem } from './toolbar-item';

import type { EditorToolbarProps } from '../types';

// ----------------------------------------------------------------------

export function LinkBlock({ editor }: Pick<EditorToolbarProps, 'editor'>) {
  const [url, setUrl] = useState('');

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    const previousUrl = editor?.getAttributes('link').href;

    setAnchorEl(event.currentTarget);

    if (previousUrl) {
      setUrl(previousUrl);
    } else {
      setUrl('');
    }
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleUpdateUrl = useCallback(() => {
    handleClosePopover();

    if (!url) {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor, url]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <ToolbarItem
        aria-label="Link"
        active={editor.isActive('link')}
        className={editorClasses.toolbar.link}
        onClick={handleOpenPopover}
        icon={
          <path d="M17.6567 14.8284L16.2425 13.4142L17.6567 12C19.2188 10.4379 19.2188 7.90524 17.6567 6.34314C16.0946 4.78105 13.5619 4.78105 11.9998 6.34314L10.5856 7.75736L9.17139 6.34314L10.5856 4.92893C12.9287 2.58578 16.7277 2.58578 19.0709 4.92893C21.414 7.27208 21.414 11.0711 19.0709 13.4142L17.6567 14.8284ZM14.8282 17.6569L13.414 19.0711C11.0709 21.4142 7.27189 21.4142 4.92875 19.0711C2.5856 16.7279 2.5856 12.9289 4.92875 10.5858L6.34296 9.17157L7.75717 10.5858L6.34296 12C4.78086 13.5621 4.78086 16.0948 6.34296 17.6569C7.90506 19.2189 10.4377 19.2189 11.9998 17.6569L13.414 16.2426L14.8282 17.6569ZM14.8282 7.75736L16.2425 9.17157L9.17139 16.2426L7.75717 14.8284L14.8282 7.75736Z" />
        }
      />
      <ToolbarItem
        aria-label="Unset link"
        disabled={!editor.isActive('link')}
        className={editorClasses.toolbar.unsetlink}
        onClick={() => editor.chain().focus().unsetLink().run()}
        icon={
          <path d="M17.657 14.8284L16.2428 13.4142L17.657 12C19.2191 10.4379 19.2191 7.90526 17.657 6.34316C16.0949 4.78106 13.5622 4.78106 12.0001 6.34316L10.5859 7.75737L9.17171 6.34316L10.5859 4.92895C12.9291 2.5858 16.7281 2.5858 19.0712 4.92895C21.4143 7.27209 21.4143 11.0711 19.0712 13.4142L17.657 14.8284ZM14.8286 17.6569L13.4143 19.0711C11.0712 21.4142 7.27221 21.4142 4.92907 19.0711C2.58592 16.7279 2.58592 12.9289 4.92907 10.5858L6.34328 9.17159L7.75749 10.5858L6.34328 12C4.78118 13.5621 4.78118 16.0948 6.34328 17.6569C7.90538 19.219 10.438 19.219 12.0001 17.6569L13.4143 16.2427L14.8286 17.6569ZM14.8286 7.75737L16.2428 9.17159L9.17171 16.2427L7.75749 14.8284L14.8286 7.75737ZM5.77539 2.29291L7.70724 1.77527L8.74252 5.63897L6.81067 6.15661L5.77539 2.29291ZM15.2578 18.3611L17.1896 17.8434L18.2249 21.7071L16.293 22.2248L15.2578 18.3611ZM2.29303 5.77527L6.15673 6.81054L5.63909 8.7424L1.77539 7.70712L2.29303 5.77527ZM18.3612 15.2576L22.2249 16.2929L21.7072 18.2248L17.8435 17.1895L18.3612 15.2576Z" />
        }
      />

      <Popover
        id={anchorEl ? 'simple-popover' : undefined}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2.5 } } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          URL
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <TextField
            size="small"
            placeholder="Enter URL here..."
            value={url}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setUrl(event.target.value);
            }}
            sx={{ width: 240 }}
          />
          <Button variant="contained" onClick={handleUpdateUrl}>
            Apply
          </Button>
        </Stack>
      </Popover>
    </>
  );
}

```

# components/toolbar-item.tsx

```tsx
import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import SvgIcon from '@mui/material/SvgIcon';
import ButtonBase from '@mui/material/ButtonBase';

import type { EditorToolbarItemProps } from '../types';

// ----------------------------------------------------------------------

export function ToolbarItem({
  sx,
  icon,
  label,
  active,
  disabled,
  ...other
}: ButtonBaseProps & EditorToolbarItemProps) {
  return (
    <ButtonBase
      sx={{
        px: 0.75,
        width: 28,
        height: 28,
        borderRadius: 0.75,
        typography: 'body2',
        '&:hover': { bgcolor: 'action.hover' },
        ...(active && { bgcolor: 'action.selected' }),
        ...(disabled && { pointerEvents: 'none', cursor: 'not-allowed', opacity: 0.48 }),
        ...sx,
      }}
      {...other}
    >
      {icon && <SvgIcon sx={{ fontSize: 18 }}>{icon}</SvgIcon>}

      {label && label}
    </ButtonBase>
  );
}

```

# editor.tsx

```tsx
import { common, createLowlight } from 'lowlight';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import StarterKitExtension from '@tiptap/starter-kit';
import TextAlignExtension from '@tiptap/extension-text-align';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import { useState, useEffect, forwardRef, useCallback } from 'react';
import CodeBlockLowlightExtension from '@tiptap/extension-code-block-lowlight';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';

import Stack from '@mui/material/Stack';
import Portal from '@mui/material/Portal';
import Backdrop from '@mui/material/Backdrop';
import FormHelperText from '@mui/material/FormHelperText';

import { Toolbar } from './toolbar';
import { StyledRoot } from './styles';
import { editorClasses } from './classes';
import { CodeHighlightBlock } from './components/code-highlight-block';

import type { EditorProps } from './types';

// ----------------------------------------------------------------------

export const Editor = forwardRef<HTMLDivElement, EditorProps>(
  (
    {
      sx,
      error,
      onChange,
      slotProps,
      helperText,
      resetValue,
      editable = true,
      fullItem = false,
      value: content = '',
      placeholder = 'Write something awesome...',
      ...other
    },
    ref
  ) => {
    const [fullScreen, setFullScreen] = useState(false);

    const handleToggleFullScreen = useCallback(() => {
      setFullScreen((prev) => !prev);
    }, []);

    const lowlight = createLowlight(common);

    const editor = useEditor({
      content,
      editable,
      extensions: [
        StarterKitExtension.configure({
          codeBlock: false,
          code: { HTMLAttributes: { class: editorClasses.content.codeInline } },
          heading: { HTMLAttributes: { class: editorClasses.content.heading } },
          horizontalRule: { HTMLAttributes: { class: editorClasses.content.hr } },
          listItem: { HTMLAttributes: { class: editorClasses.content.listItem } },
          blockquote: { HTMLAttributes: { class: editorClasses.content.blockquote } },
          bulletList: { HTMLAttributes: { class: editorClasses.content.bulletList } },
          orderedList: { HTMLAttributes: { class: editorClasses.content.orderedList } },
        }),
        PlaceholderExtension.configure({
          placeholder,
          emptyEditorClass: editorClasses.content.placeholder,
        }),
        ImageExtension.configure({ HTMLAttributes: { class: editorClasses.content.image } }),
        TextAlignExtension.configure({ types: ['heading', 'paragraph'] }),
        LinkExtension.configure({
          autolink: true,
          openOnClick: false,
          HTMLAttributes: { class: editorClasses.content.link },
        }),
        CodeBlockLowlightExtension.extend({
          addNodeView() {
            return ReactNodeViewRenderer(CodeHighlightBlock);
          },
        }).configure({ lowlight, HTMLAttributes: { class: editorClasses.content.codeBlock } }),
      ],
      onUpdate({ editor: _editor }) {
        const html = _editor.getHTML();
        onChange?.(html);
      },
      ...other,
    });

    useEffect(() => {
      const timer = setTimeout(() => {
        if (editor?.isEmpty && content !== '<p></p>') {
          editor.commands.setContent(content);
        }
      }, 100);
      return () => clearTimeout(timer);
    }, [content, editor]);

    useEffect(() => {
      if (resetValue && !content) {
        editor?.commands.clearContent();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);

    useEffect(() => {
      if (fullScreen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }, [fullScreen]);

    return (
      <Portal disablePortal={!fullScreen}>
        {fullScreen && <Backdrop open sx={{ zIndex: (theme) => theme.zIndex.modal - 1 }} />}

        <Stack sx={{ ...(!editable && { cursor: 'not-allowed' }), ...slotProps?.wrap }}>
          <StyledRoot
            error={!!error}
            disabled={!editable}
            fullScreen={fullScreen}
            className={editorClasses.root}
            sx={sx}
          >
            <Toolbar
              editor={editor}
              fullItem={fullItem}
              fullScreen={fullScreen}
              onToggleFullScreen={handleToggleFullScreen}
            />
            <EditorContent
              ref={ref}
              spellCheck="false"
              autoComplete="off"
              autoCapitalize="off"
              editor={editor}
              className={editorClasses.content.root}
            />
          </StyledRoot>

          {helperText && (
            <FormHelperText error={!!error} sx={{ px: 2 }}>
              {helperText}
            </FormHelperText>
          )}
        </Stack>
      </Portal>
    );
  }
);

```

# index.ts

```ts
export * from './editor';

export * from './classes';

export type * from './types';

```

# styles.tsx

```tsx
import type { StackProps } from '@mui/material/Stack';

import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';

import { editorClasses } from './classes';

// ----------------------------------------------------------------------

const MARGIN = '0.75em';

type StyledRootProps = StackProps & {
  error?: boolean;
  disabled?: boolean;
  fullScreen?: boolean;
};
export const StyledRoot = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'error' && prop !== 'disabled' && prop !== 'fullScreen',
})<StyledRootProps>(({ error, disabled, fullScreen, theme }) => ({
  minHeight: 240,
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
  scrollbarWidth: 'thin',
  scrollbarColor: `${varAlpha(theme.vars.palette.text.disabledChannel, 0.4)} ${varAlpha(theme.vars.palette.text.disabledChannel, 0.08)}`,
  /**
   * State: error
   */
  ...(error && {
    border: `solid 1px ${theme.vars.palette.error.main}`,
  }),
  /**
   * State: disabled
   */
  ...(disabled && {
    opacity: 0.48,
    pointerEvents: 'none',
  }),
  /**
   * State: fullScreen
   */
  ...(fullScreen && {
    top: 16,
    left: 16,
    position: 'fixed',
    zIndex: theme.zIndex.modal,
    maxHeight: 'unset !important',
    width: `calc(100% - ${32}px)`,
    height: `calc(100% - ${32}px)`,
    backgroundColor: theme.vars.palette.background.default,
  }),
  /**
   * Placeholder
   */
  [`& .${editorClasses.content.placeholder}`]: {
    '&:first-of-type::before': {
      ...theme.typography.body2,
      height: 0,
      float: 'left',
      pointerEvents: 'none',
      content: 'attr(data-placeholder)',
      color: theme.vars.palette.text.disabled,
    },
  },
  /**
   * Content
   */
  [`& .${editorClasses.content.root}`]: {
    display: 'flex',
    flex: '1 1 auto',
    overflowY: 'auto',
    flexDirection: 'column',
    borderBottomLeftRadius: 'inherit',
    borderBottomRightRadius: 'inherit',
    backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
    ...(error && {
      backgroundColor: varAlpha(theme.vars.palette.error.mainChannel, 0.08),
    }),
    '& .tiptap': {
      '> * + *': {
        marginTop: 0,
        marginBottom: MARGIN,
      },
      '&.ProseMirror': {
        flex: '1 1 auto',
        outline: 'none',
        padding: theme.spacing(0, 2),
      },
      /**
       * Heading & Paragraph
       */
      h1: { ...theme.typography.h1, marginTop: 40, marginBottom: 8 },
      h2: { ...theme.typography.h2, marginTop: 40, marginBottom: 8 },
      h3: { ...theme.typography.h3, marginTop: 24, marginBottom: 8 },
      h4: { ...theme.typography.h4, marginTop: 24, marginBottom: 8 },
      h5: { ...theme.typography.h5, marginTop: 24, marginBottom: 8 },
      h6: { ...theme.typography.h6, marginTop: 24, marginBottom: 8 },
      p: { ...theme.typography.body1, marginBottom: '1.25rem' },
      [`& .${editorClasses.content.heading}`]: {},
      /**
       * Link
       */
      [`& .${editorClasses.content.link}`]: {
        color: theme.vars.palette.primary.main,
      },
      /**
       * Hr Divider
       */
      [`& .${editorClasses.content.hr}`]: {
        flexShrink: 0,
        borderWidth: 0,
        margin: '2em 0',
        msFlexNegative: 0,
        WebkitFlexShrink: 0,
        borderStyle: 'solid',
        borderBottomWidth: 'thin',
        borderColor: theme.vars.palette.divider,
      },
      /**
       * Image
       */ [`& .${editorClasses.content.image}`]: {
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        margin: 'auto auto 1.25em',
      },
      /**
       * List
       */ [`& .${editorClasses.content.bulletList}`]: {
        paddingLeft: 16,
        listStyleType: 'disc',
      },
      [`& .${editorClasses.content.orderedList}`]: {
        paddingLeft: 16,
      },
      [`& .${editorClasses.content.listItem}`]: {
        lineHeight: 2,
        '& > p': { margin: 0, display: 'inline-block' },
      },
      /**
       * Blockquote
       */
      [`& .${editorClasses.content.blockquote}`]: {
        lineHeight: 1.5,
        fontSize: '1.5em',
        margin: '24px auto',
        position: 'relative',
        fontFamily: 'Georgia, serif',
        padding: theme.spacing(3, 3, 3, 8),
        color: theme.vars.palette.text.secondary,
        borderLeft: `solid 8px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
        [theme.breakpoints.up('md')]: {
          width: '100%',
          maxWidth: 640,
        },
        '& p': {
          margin: 0,
          fontSize: 'inherit',
          fontFamily: 'inherit',
        },
        '&::before': {
          left: 16,
          top: -8,
          display: 'block',
          fontSize: '3em',
          content: '"\\201C"',
          position: 'absolute',
          color: theme.vars.palette.text.disabled,
        },
      },
      /**
       * Code inline
       */
      [`& .${editorClasses.content.codeInline}`]: {
        padding: theme.spacing(0.25, 0.5),
        color: theme.vars.palette.text.secondary,
        fontSize: theme.typography.body2.fontSize,
        borderRadius: theme.shape.borderRadius / 2,
        backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.2),
      },
      /**
       * Code block
       */
      [`& .${editorClasses.content.codeBlock}`]: {
        position: 'relative',
        '& pre': {
          overflowX: 'auto',
          color: theme.vars.palette.common.white,
          padding: theme.spacing(5, 3, 3, 3),
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.vars.palette.grey[900],
          fontFamily: "'JetBrainsMono', monospace",
          '& code': { fontSize: theme.typography.body2.fontSize },
        },
        [`& .${editorClasses.content.langSelect}`]: {
          top: 8,
          right: 8,
          zIndex: 1,
          padding: 4,
          outline: 'none',
          borderRadius: 4,
          position: 'absolute',
          color: theme.vars.palette.common.white,
          fontWeight: theme.typography.fontWeightMedium,
          borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        },
      },
    },
  },
}));

```

# toolbar.tsx

```tsx
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import { varAlpha } from 'src/theme/styles';

import { editorClasses } from './classes';
import { LinkBlock } from './components/link-block';
import { ImageBlock } from './components/image-block';
import { ToolbarItem } from './components/toolbar-item';
import { HeadingBlock } from './components/heading-block';

import type { EditorToolbarProps } from './types';

// ----------------------------------------------------------------------

/**
 * https://remixicon.com
 */

export function Toolbar({ editor, fullItem, fullScreen, onToggleFullScreen }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <Stack
      spacing={1}
      direction="row"
      flexWrap="wrap"
      alignItems="center"
      divider={<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />}
      className={editorClasses.toolbar.root}
      sx={{
        p: 1.25,
        bgcolor: 'background.paper',
        borderTopRightRadius: 'inherit',
        borderTopLeftRadius: 'inherit',
        borderBottom: (theme) =>
          `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
      }}
    >
      <HeadingBlock editor={editor} />

      {/* Text style */}
      <Stack direction="row" spacing={0.5}>
        <ToolbarItem
          aria-label="Bold"
          active={editor.isActive('bold')}
          className={editorClasses.toolbar.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={
            <path d="M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z" />
          }
        />
        <ToolbarItem
          aria-label="Italic"
          active={editor.isActive('italic')}
          className={editorClasses.toolbar.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={<path d="M15 20H7V18H9.92661L12.0425 6H9V4H17V6H14.0734L11.9575 18H15V20Z" />}
        />
        <ToolbarItem
          aria-label="Strike"
          active={editor.isActive('strike')}
          className={editorClasses.toolbar.italic}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={
            <path d="M17.1538 14C17.3846 14.5161 17.5 15.0893 17.5 15.7196C17.5 17.0625 16.9762 18.1116 15.9286 18.867C14.8809 19.6223 13.4335 20 11.5862 20C9.94674 20 8.32335 19.6185 6.71592 18.8555V16.6009C8.23538 17.4783 9.7908 17.917 11.3822 17.917C13.9333 17.917 15.2128 17.1846 15.2208 15.7196C15.2208 15.0939 15.0049 14.5598 14.5731 14.1173C14.5339 14.0772 14.4939 14.0381 14.4531 14H3V12H21V14H17.1538ZM13.076 11H7.62908C7.4566 10.8433 7.29616 10.6692 7.14776 10.4778C6.71592 9.92084 6.5 9.24559 6.5 8.45207C6.5 7.21602 6.96583 6.165 7.89749 5.299C8.82916 4.43299 10.2706 4 12.2219 4C13.6934 4 15.1009 4.32808 16.4444 4.98426V7.13591C15.2448 6.44921 13.9293 6.10587 12.4978 6.10587C10.0187 6.10587 8.77917 6.88793 8.77917 8.45207C8.77917 8.87172 8.99709 9.23796 9.43293 9.55079C9.86878 9.86362 10.4066 10.1135 11.0463 10.3004C11.6665 10.4816 12.3431 10.7148 13.076 11H13.076Z" />
          }
        />
      </Stack>

      {/* List */}
      <Stack direction="row" spacing={0.5}>
        <ToolbarItem
          aria-label="Bullet list"
          active={editor.isActive('bulletList')}
          className={editorClasses.toolbar.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={
            <path d="M8 4H21V6H8V4ZM4.5 6.5C3.67157 6.5 3 5.82843 3 5C3 4.17157 3.67157 3.5 4.5 3.5C5.32843 3.5 6 4.17157 6 5C6 5.82843 5.32843 6.5 4.5 6.5ZM4.5 13.5C3.67157 13.5 3 12.8284 3 12C3 11.1716 3.67157 10.5 4.5 10.5C5.32843 10.5 6 11.1716 6 12C6 12.8284 5.32843 13.5 4.5 13.5ZM4.5 20.4C3.67157 20.4 3 19.7284 3 18.9C3 18.0716 3.67157 17.4 4.5 17.4C5.32843 17.4 6 18.0716 6 18.9C6 19.7284 5.32843 20.4 4.5 20.4ZM8 11H21V13H8V11ZM8 18H21V20H8V18Z" />
          }
        />
        <ToolbarItem
          aria-label="Ordered list"
          active={editor.isActive('orderedList')}
          className={editorClasses.toolbar.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={
            <path d="M8 4H21V6H8V4ZM5 3V6H6V7H3V6H4V4H3V3H5ZM3 14V11.5H5V11H3V10H6V12.5H4V13H6V14H3ZM5 19.5H3V18.5H5V18H3V17H6V21H3V20H5V19.5ZM8 11H21V13H8V11ZM8 18H21V20H8V18Z" />
          }
        />
      </Stack>

      {/* Text align */}
      <Stack direction="row" spacing={0.5}>
        <ToolbarItem
          aria-label="Align left"
          active={editor.isActive({ textAlign: 'left' })}
          className={editorClasses.toolbar.alignLeft}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          icon={<path d="M3 4H21V6H3V4ZM3 19H17V21H3V19ZM3 14H21V16H3V14ZM3 9H17V11H3V9Z" />}
        />
        <ToolbarItem
          aria-label="Align center"
          active={editor.isActive({ textAlign: 'center' })}
          className={editorClasses.toolbar.alignCenter}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          icon={<path d="M3 4H21V6H3V4ZM5 19H19V21H5V19ZM3 14H21V16H3V14ZM5 9H19V11H5V9Z" />}
        />
        <ToolbarItem
          aria-label="Align right"
          active={editor.isActive({ textAlign: 'right' })}
          className={editorClasses.toolbar.alignRight}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          icon={<path d="M3 4H21V6H3V4ZM7 19H21V21H7V19ZM3 14H21V16H3V14ZM7 9H21V11H7V9Z" />}
        />
        <ToolbarItem
          aria-label="Align justify"
          active={editor.isActive({ textAlign: 'justify' })}
          className={editorClasses.toolbar.alignJustify}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          icon={<path d="M3 4H21V6H3V4ZM3 19H21V21H3V19ZM3 14H21V16H3V14ZM3 9H21V11H3V9Z" />}
        />
      </Stack>

      {/* Code - Code block */}
      {fullItem && (
        <Stack direction="row" spacing={0.5}>
          <ToolbarItem
            aria-label="Align justify"
            active={editor.isActive('code')}
            className={editorClasses.toolbar.code}
            onClick={() => editor.chain().focus().toggleCode().run()}
            icon={
              <path d="M16.95 8.46448L18.3642 7.05026L23.3139 12L18.3642 16.9498L16.95 15.5355L20.4855 12L16.95 8.46448ZM7.05048 8.46448L3.51495 12L7.05048 15.5355L5.63627 16.9498L0.686523 12L5.63627 7.05026L7.05048 8.46448Z" />
            }
          />
          <ToolbarItem
            aria-label="Align justify"
            active={editor.isActive('codeBlock')}
            className={editorClasses.toolbar.codeBlock}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            icon={
              <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM4 5V19H20V5H4ZM20 12L16.4645 15.5355L15.0503 14.1213L17.1716 12L15.0503 9.87868L16.4645 8.46447L20 12ZM6.82843 12L8.94975 14.1213L7.53553 15.5355L4 12L7.53553 8.46447L8.94975 9.87868L6.82843 12ZM11.2443 17H9.11597L12.7557 7H14.884L11.2443 17Z" />
            }
          />
        </Stack>
      )}

      {/* Blockquote - Hr line */}
      {fullItem && (
        <Stack direction="row" spacing={0.5}>
          <ToolbarItem
            aria-label="Blockquote"
            active={editor.isActive('blockquote')}
            className={editorClasses.toolbar.blockquote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            icon={
              <path d="M4.58341 17.3211C3.55316 16.2274 3 15 3 13.0103C3 9.51086 5.45651 6.37366 9.03059 4.82318L9.92328 6.20079C6.58804 8.00539 5.93618 10.346 5.67564 11.822C6.21263 11.5443 6.91558 11.4466 7.60471 11.5105C9.40908 11.6778 10.8312 13.159 10.8312 15C10.8312 16.933 9.26416 18.5 7.33116 18.5C6.2581 18.5 5.23196 18.0095 4.58341 17.3211ZM14.5834 17.3211C13.5532 16.2274 13 15 13 13.0103C13 9.51086 15.4565 6.37366 19.0306 4.82318L19.9233 6.20079C16.588 8.00539 15.9362 10.346 15.6756 11.822C16.2126 11.5443 16.9156 11.4466 17.6047 11.5105C19.4091 11.6778 20.8312 13.159 20.8312 15C20.8312 16.933 19.2642 18.5 17.3312 18.5C16.2581 18.5 15.232 18.0095 14.5834 17.3211Z" />
            }
          />
          <ToolbarItem
            aria-label="Horizontal"
            className={editorClasses.toolbar.hr}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={<path d="M2 11H4V13H2V11ZM6 11H18V13H6V11ZM20 11H22V13H20V11Z" />}
          />
        </Stack>
      )}

      {/* Link - Image */}
      <Stack direction="row" spacing={0.5}>
        <LinkBlock editor={editor} />
        <ImageBlock editor={editor} />
      </Stack>

      {/* HardBreak - Clear */}
      <Stack direction="row" spacing={0.5}>
        <ToolbarItem
          aria-label="HardBreak"
          onClick={() => editor.chain().focus().setHardBreak().run()}
          className={editorClasses.toolbar.hardbreak}
          icon={
            <path d="M15 18H16.5C17.8807 18 19 16.8807 19 15.5C19 14.1193 17.8807 13 16.5 13H3V11H16.5C18.9853 11 21 13.0147 21 15.5C21 17.9853 18.9853 20 16.5 20H15V22L11 19L15 16V18ZM3 4H21V6H3V4ZM9 18V20H3V18H9Z" />
          }
        />
        <ToolbarItem
          aria-label="Clear"
          className={editorClasses.toolbar.clear}
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          icon={
            <path d="M12.6512 14.0654L11.6047 20H9.57389L10.9247 12.339L3.51465 4.92892L4.92886 3.51471L20.4852 19.0711L19.071 20.4853L12.6512 14.0654ZM11.7727 7.53009L12.0425 5.99999H10.2426L8.24257 3.99999H19.9999V5.99999H14.0733L13.4991 9.25652L11.7727 7.53009Z" />
          }
        />
      </Stack>

      {/* Undo - Redo */}
      {fullItem && (
        <Stack direction="row" spacing={0.5}>
          <ToolbarItem
            aria-label="Undo"
            className={editorClasses.toolbar.undo}
            disabled={!editor.can().chain().focus().undo().run()}
            onClick={() => editor.chain().focus().undo().run()}
            icon={
              <path d="M8 7V11L2 6L8 1V5H13C17.4183 5 21 8.58172 21 13C21 17.4183 17.4183 21 13 21H4V19H13C16.3137 19 19 16.3137 19 13C19 9.68629 16.3137 7 13 7H8Z" />
            }
          />
          <ToolbarItem
            aria-label="Redo"
            className={editorClasses.toolbar.redo}
            disabled={!editor.can().chain().focus().redo().run()}
            onClick={() => editor.chain().focus().redo().run()}
            icon={
              <path d="M16 7H11C7.68629 7 5 9.68629 5 13C5 16.3137 7.68629 19 11 19H20V21H11C6.58172 21 3 17.4183 3 13C3 8.58172 6.58172 5 11 5H16V1L22 6L16 11V7Z" />
            }
          />
        </Stack>
      )}

      <Stack direction="row" spacing={0.5}>
        <ToolbarItem
          aria-label="Fullscreen"
          className={editorClasses.toolbar.fullscreen}
          onClick={onToggleFullScreen}
          icon={
            fullScreen ? (
              <path d="M18 7H22V9H16V3H18V7ZM8 9H2V7H6V3H8V9ZM18 17V21H16V15H22V17H18ZM8 15V21H6V17H2V15H8Z" />
            ) : (
              <path d="M16 3H22V9H20V5H16V3ZM2 3H8V5H4V9H2V3ZM20 19V15H22V21H16V19H20ZM4 19H8V21H2V15H4V19Z" />
            )
          }
        />
      </Stack>
    </Stack>
  );
}

```

# types.ts

```ts
import type { Theme, SxProps } from '@mui/material/styles';
import type { Editor, Extension, EditorOptions } from '@tiptap/react';

// ----------------------------------------------------------------------

export type EditorProps = Partial<EditorOptions> & {
  value?: string;
  error?: boolean;
  fullItem?: boolean;
  resetValue?: boolean;
  sx?: SxProps<Theme>;
  placeholder?: string;
  helperText?: React.ReactNode;
  onChange?: (value: string) => void;
  slotProps?: {
    wrap: SxProps<Theme>;
  };
};

export type EditorToolbarProps = {
  fullScreen: boolean;
  editor: Editor | null;
  onToggleFullScreen: () => void;
  fullItem?: EditorProps['fullItem'];
};

export type EditorToolbarItemProps = {
  icon?: React.ReactNode;
  label?: string;
  active?: boolean;
  disabled?: boolean;
};

export type EditorCodeHighlightBlockProps = {
  extension: Extension;
  updateAttributes: (attributes: Record<string, any>) => void;
  node: {
    attrs: {
      language: string;
    };
  };
};

```

