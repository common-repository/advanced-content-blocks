import { createElement } from 'react';

export function RawHTML( { children, ...props } ) {
    // Render wrapper only if props are non-empty.
    const tagName = 'div';

    // Merge HTML into assigned props.
    props = {
        dangerouslySetInnerHTML: { __html: children },
        ...props,
    };

    return createElement( tagName, props );
}