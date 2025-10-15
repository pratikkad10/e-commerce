import { NavLink } from 'react-router-dom'

const Link = (props: { linkName: string, link: string, icon?: JSX.Element }) => {
    return (
            <NavLink
            to={props.link}
            className={({ isActive }) =>
                `flex items-center gap-2 ${
                    isActive
                        ? "text-primary font-semibold"
                        : "text-foreground hover:text-primary transition-colors"
                }`
            }
        >
            {props.icon && <span className="md:hidden">{props.icon}</span>}
            {props.linkName}
        </NavLink>
    )
}

export default Link