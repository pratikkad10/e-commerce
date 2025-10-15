const Description = ({ description }: { description: string }) => {
  return (
    <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex-1">{description}</p>
  )
}

export default Description
