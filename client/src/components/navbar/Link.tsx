import { NavLink } from 'react-router-dom'

const Link = (props: { linkName: string, link: string }) => {
    return (
            <NavLink
                to={props.link}
                className={({ isActive }) =>
                    isActive
                        ? "text-primary font-semibold"
                        : "text-foreground hover:text-primary transition-colors"
                }
            >
                {props.linkName}
            </NavLink>
    )
}

export default Link