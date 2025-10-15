
const Name = ({name} : {name: string}) => {
  return (
    <h2 className="font-semibold text-base text-card-foreground mb-1 line-clamp-2">{name}</h2>
  )
}

export default Name