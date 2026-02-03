import { useState } from "react"
import { FaChevronRight } from "react-icons/fa"

export type fileFolderDataType = { name: string; relativePath: string; children?: fileFolderDataType[] }

const TreeNode = ({ fileFolderData }: { fileFolderData: fileFolderDataType | null }) => {
  const [visibility, setVisibility] = useState<{ [key: string]: boolean }>({})
  const [hovered, setHovered] = useState<string | null>(null)

  const toggleVisibility = (name: string) => {
    setVisibility(prev => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  const hasChildren = fileFolderData?.children && fileFolderData.children.length > 0

  return (
    <div style={{ paddingLeft: "12px", fontFamily: "Fira Code, monospace", fontSize: "14px", color: "#e0e0e0", backgroundColor:'transparent' }}>
      
      {hasChildren ? (
        <button
          onClick={() => toggleVisibility(fileFolderData?.name)}
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: hovered === fileFolderData?.name ? "rgba(97,218,251,0.1)" : "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            marginBottom: "2px",
            color: "#7ac7ff",
            outline: "none",
            fontWeight: 500,
            borderRadius: "4px",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={() => setHovered(fileFolderData?.name)}
          onMouseLeave={() => setHovered(null)}
        >
          <FaChevronRight
            style={{
              marginRight: "6px",
              fontSize: "12px",
              transition: "transform 0.2s ease",
              transform: visibility[fileFolderData?.name] ? "rotate(90deg)" : "rotate(0deg)",
              color: "#61dafb",
            }}
          />
          {fileFolderData?.name}
        </button>
      ) : (
        <div
          style={{
            padding: "4px 8px",
            marginBottom: "2px",
            marginLeft: "18px",
            cursor: "pointer",
            borderRadius: "4px",
            backgroundColor: hovered === fileFolderData?.name ? "rgba(97,218,251,0.05)" : "transparent",
            color: "#6cb0e8",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={() => setHovered(fileFolderData?.name || null)}
          onMouseLeave={() => setHovered(null)}
        >
          {fileFolderData?.name}
        </div>
      )}

      {visibility[fileFolderData?.name || 0] &&
        fileFolderData?.children?.map(node => (
          <TreeNode fileFolderData={node} key={node.relativePath} />
        ))}
    </div>
  )
}

export default TreeNode
