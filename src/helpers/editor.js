const { keycodes } = wp.utils;
const { BACKSPACE, DELETE } = keycodes;
const { Component } = wp.element;
const { __ } = wp.i18n; // Import __() from wp.i18n
const ld = require( 'lodash' );
const _ = ld.noConflict();

export default class Editor extends Component {
    constructor( props ) {
        super( props );
        this.initialize = this.initialize.bind( this );
        this.onSetup = this.onSetup.bind( this );

        this.state = {
            content: this.props.content
        };
    }

    componentDidMount() {
        const { baseURL, suffix } = window.wpEditorL10n.tinymce;

        window.tinymce.EditorManager.overrideDefaults( {
            base_url: baseURL,
            suffix,
        } );

        if ( document.readyState === 'complete' ) {
            this.initialize();
        } else {
            window.addEventListener( 'DOMContentLoaded', this.initialize );
        }
    }

    componentWillUnmount() {
        window.addEventListener( 'DOMContentLoaded', this.initialize );
        wp.oldEditor.remove( `editor-${ this.props.id }` );
    }

    componentDidUpdate( prevProps ) {
        const { id, content } = this.props;

        const editor = window.tinymce.get( `editor-${ id }` );

        if ( prevProps.content !== content ) {
            editor.setContent( content || '' );
        }
    }

    initialize() {
        const { id } = this.props;
        let settings = window.wpEditorL10n.tinymce.settings;

        settings['toolbar1'] = settings['toolbar1'].replace('wp_more,', '');

        wp.oldEditor.initialize( `editor-${ id }`, {
            tinymce: {
                ...settings,
                inline: true,
                content_css: false,
                fixed_toolbar_container: `#toolbar-${ id }`,
                setup: this.onSetup,
            },
        } );
    }

    onSetup( editor ) {
        const { content } = this.props;
        const { ref } = this;

        if ( content ) {
            editor.on( 'loadContent', () => editor.setContent( content ) );
        }

        editor.on( 'blur', () => {
            this.updateContent( editor.getContent() );
            return false;
        } );

        editor.on( 'keydown', ( event ) => {
            if ( ( event.keyCode === BACKSPACE || event.keyCode === DELETE ) && isTmceEmpty( editor ) ) {
                // delete the block
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        } );

        editor.addButton( 'kitchensink', {
            tooltip: __( 'More' ),
            icon: 'dashicon dashicons-editor-kitchensink',
            onClick: function() {
                const button = this;
                const active = ! button.active();

                button.active( active );
                editor.dom.toggleClass( ref, 'has-advanced-toolbar', active );
            },
        } );
    }

    updateContent(content){
        let state = this.state;

        this.setState({ content: content });
        state.content = content;
        this.props.onChange(state);
    }

    render() {
        const { isSelected, id } = this.props;
        return [
            <div
                key="toolbar"
                id={ `toolbar-${ id }` }
                ref={ ref => this.ref = ref }
                className="freeform-toolbar"
                style={ ! isSelected ? { display: 'none' } : {} }
            />,
            <div
                key="editor"
                id={ `editor-${ id }` }
                className="wp-block-freeform blocks-rich-text__tinymce"
            />,
        ];
    }
}


function isTmceEmpty( editor ) {
    // When tinyMce is empty the content seems to be:
    // <p><br data-mce-bogus="1"></p>
    // avoid expensive checks for large documents
    const body = editor.getBody();
    if ( body.childNodes.length > 1 ) {
        return false;
    } else if ( body.childNodes.length === 0 ) {
        return true;
    }
    if ( body.childNodes[ 0 ].childNodes.length > 1 ) {
        return false;
    }
    return /^\n?$/.test( body.innerText || body.textContent );
}