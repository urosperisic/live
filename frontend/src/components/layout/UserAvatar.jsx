export default function UserAvatar({ username = '?' }) {
  return (
    <div className="avatar" aria-hidden="true">
      {username[0]}
    </div>
  )
}