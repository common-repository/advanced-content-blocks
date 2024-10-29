//  Import CSS.
import './style.scss';
import './editor.scss';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks
const { Component } = wp.element; // Import registerBlockType() from wp.blocks
import Editor from '../helpers/editor.js';
import { RawHTML } from '../helpers/functions.js';
import AutosizeInput from 'react-input-autosize'


let acbTabsIndex = 0;
/**
 * Register: aa Gutenberg Block.
 *t
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/hanqdbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType( 'advanced-content-blocks/tabs', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Tabs' ), // Block title.
	icon: 'screenoptions',
	category: 'layout',
	keywords: [
		__( 'tabs' )
	],
    supports: {
        customClassName: true
    },
    attributes: {
	    rand: {
	        type: "number",
            default: 0
        },
        tabs: {
            type: 'array'
        },
        index:{
	        type: 'number',
            default: -1
        }
    },
	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	edit: function(  { attributes, setAttributes, isSelected, className }  ) {
	    if(attributes.index === -1){
            acbTabsIndex++;
	        setAttributes({
                index: acbTabsIndex
            })
        } else {
	        acbTabsIndex = attributes.index;
        }
		return (
            <Tabs
                className={className}
                isSelected={ isSelected }
                isEdit={ true }
                tabs={attributes.tabs}
                index={acbTabsIndex}
                onChange={ (state) =>  setAttributes( {
                    tabs: state.tabs,
                    rand: attributes.rand++
                } ) }
            />
        );
	},

	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 */
	save: function( { attributes, isSelected, className } ) {
        return (
            <Tabs
                className={className}
                isSelected={ isSelected }
                isEdit={ false }
                tabs={attributes.tabs}
            />
        );
	},
} );

class Tabs extends Component {
    constructor(props) {
        super(props);
        let tabs;
        if(typeof props.tabs === 'undefined') {
            tabs = [{
                title: '',
                content: ''
            }];
        } else {
            tabs = props.tabs;
        }

        this.state = {
            active: 0,
            activePart: 'tab',
            tabs: tabs
        };
    }

    render(){
        const component = this;
        const tabs = this.state.tabs;
        const isEdit = this.props.isEdit;
        const isSelected = this.props.isSelected;
        const componentIndex = this.props.index;
        let   activePart = this.state.activePart;
        const onSetActivePart = ( activePart ) => () => component.setState( { activePart: activePart } );

        const head = Object.keys(tabs).map((index) => {
            let className = 'acb-tabs-block-tab';
            let isActive = (parseInt(index) === component.state.active);
            if(isActive) className += ' active';
            return <li key={'acb_tab_' + componentIndex + '_title_' + index} className={ className } onClick={ (event) => { component.setState({ active: parseInt(index) }) } }>
                { (isEdit) ? (<AutosizeInput
                     value={tabs[index]['title']}
                     onChange={ (event) => {
                         component.updateTab(index, 'title', event.target.value)
                     } }
                     onFocus={onSetActivePart('tab')}
                     placeholder={ __('Tab') } />) : tabs[index]['title'] }
            </li>;
        });

        const content = Object.keys(tabs).map((index) => {
            let className = 'acb-tabs-block-content';
            let isActive = (parseInt(index) === component.state.active);
            if(isActive) className += ' active';
            return <div key={'content_' + index} className={ className }>
                { (isEdit) ? (<Editor
                    id={'acb_tab_' + componentIndex + '_content_' + index}
                    content={tabs[index]['content']}
                    onChange={ (state) => { component.updateTab(index, 'content', state.content) } }
                    isSelected={ isActive }
                />) : <RawHTML>{tabs[index]['content']}</RawHTML> }
            </div>;
        });

        const className = (this.props.className + " acb-tabs-block").trim();
        return <div className={className}>
            <ul className="acb-tabs-block-head">
                { head }
                { (isEdit) ? (
                <li className="acb-tabs-block-tab" onClick={ (event) => this.addNewTab(event) }>
                    <i className="fa fa-plus"></i>
                </li>) : '' }
            </ul>
            <div className="acb-tabs-block-body">
                {content}
            </div>
            { (isEdit) ? (<div className="acb-tabs-block-control">
                { (component.state.active !== 0) ? (
                    <span onClick={(event) => this.moveTab('left')} className="left"><i className="fa fa-arrow-left"></i> {__('Move Left')}</span>
                ) : '' }
                { (component.state.active !== tabs.length - 1) ? (
                    <span onClick={(event) => this.moveTab('right')} className="right"><i className="fa fa-arrow-right"></i> {__('Move Right')}</span>
                ) : '' }
                    <span onClick={(event) => this.deleteTab()} className="delete"><i className="fa fa-trash"></i> {__('Delete Tab')}</span>
                </div>
            ) : '' }

        </div>;
    }

    deleteTab(){
        let state  = this.state;
        let active = parseInt(state.active);
        let tabs   = state.tabs;
        delete tabs[active];
        let newIndex = [];

        tabs.map((value) => {
            newIndex.push(value);
        });

        if(typeof newIndex[active] === 'undefined'){
            active = 0;
        }

        this.setState( {
            tabs: newIndex,
            active: active
        } );

        state.tabs = newIndex;
        this.props.onChange(state);
    }

    moveTab(side){
        let state  = this.state;
        let active = parseInt(state.active);
        let tabs   = state.tabs;
        let current = tabs[active];

        switch (side){
            case 'left':
                if(active === 0) return false;
                let prev = tabs[active - 1];

                tabs[active] = prev;
                tabs[active - 1] = current;
                this.setState( {
                    tabs: tabs,
                    active: active - 1
                } );
                state.tabs = tabs;
                this.props.onChange(state);

                break;

            case 'right':
                if(active === (tabs.length - 1)) return false;
                let next = tabs[active + 1];

                tabs[active] = next;
                tabs[active + 1] = current;
                this.setState( {
                    tabs: tabs,
                    active: active + 1
                } );
                state.tabs = tabs;
                this.props.onChange(state);
                break;
        }
    }

    addNewTab(){
        let state = this.state;
        let tabs = state.tabs;
        tabs.push({
            title: '',
            content: ''
        });

        this.setState( {
            tabs: tabs,
            active: tabs.length - 1,
            activePart: 'tab'
        } );
        state.tabs = tabs;
        this.props.onChange(state);
    }

    updateTab(index, area, content){
        let state = this.state;
        let tabs  = state.tabs;

        tabs[index][area] = content;

        this.setState({ tabs: tabs });
        state.tabs = tabs;
        this.props.onChange(state);
    }

    changeColor(element, color){
        let state = this.state;
        state[element] = color;
        this.setState(state);
        this.props.onChange(state);
    }

    handleClick(value){
        let state = this.state;
        state.icon = value;
        this.setState(state);
        this.props.onChange(state);
    }
}