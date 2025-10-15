
export const Price = ({price, comparePrice} : {price: number; comparePrice?: number}) => {
  return (
    <div className="flex items-center justify-between mb-2 mt-auto">
      <p className="text-lg font-bold text-foreground">₹{price}</p>
      <div>
        {comparePrice && (
          <p className="text-xs text-muted-foreground line-through">₹{comparePrice}</p>
        )}
      </div>
    </div>
  )
}
