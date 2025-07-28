import { useState, useEffect } from "react"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2, Plus, X, Briefcase, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Skill {
  id: string
  name: string
}

interface Role {
  _id: string
  role: string
  skills: string[]
}

export default function RolesSkills() {
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newRoleName, setNewRoleName] = useState("")
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [editRoleName, setEditRoleName] = useState("")
  const [newSkills, setNewSkills] = useState<Record<string, string>>({})
  const [addingRole, setAddingRole] = useState(false)
  const [updatingSkills, setUpdatingSkills] = useState<Record<string, boolean>>({})
  const [deletingRole, setDeletingRole] = useState<Record<string, boolean>>({})
  const [updatingRole, setUpdatingRole] = useState<Record<string, boolean>>({})

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching roles from API...')
      const response = await fetch('http://localhost:3000/api/candidate-role-skills')
      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status}`)
      }
      const result = await response.json()
      console.log('API response:', result)
      // Handle the API response structure: {success, data, count, message}
      const data = result.data || result
      const rolesArray = Array.isArray(data) ? data : []
      console.log('Setting roles:', rolesArray)
      setRoles(rolesArray)
    } catch (error) {
      console.error('Error fetching roles:', error)
      setError('Failed to fetch roles. Please check if the API server is running.')
      toast({
        title: "Error",
        description: "Failed to fetch roles. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addRole = async () => {
    if (!newRoleName.trim()) return

    try {
      setAddingRole(true)
      const response = await fetch('http://localhost:3000/api/candidate-role-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRoleName.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to add role: ${response.status}`)
      }

      const result = await response.json()
      const newRole = result.data || result
      setRoles([...roles, newRole])
      setNewRoleName("")
      toast({
        title: "Role added",
        description: `${newRole.role} has been added successfully.`
      })
    } catch (error) {
      console.error('Error adding role:', error)
      toast({
        title: "Error",
        description: "Failed to add role. Please try again.",
        variant: "destructive"
      })
    } finally {
      setAddingRole(false)
    }
  }

  const deleteRole = async (roleId: string) => {
    const role = roles.find(r => r._id === roleId)
    if (!role) return

    try {
      setDeletingRole({ ...deletingRole, [roleId]: true })
      const response = await fetch(`http://localhost:3000/api/candidate-role-skills/${roleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete role: ${response.status}`)
      }

      setRoles(roles.filter(r => r._id !== roleId))
    toast({
      title: "Role deleted",
        description: `${role.role} has been removed.`,
        variant: "destructive"
      })
    } catch (error) {
      console.error('Error deleting role:', error)
      toast({
        title: "Error",
        description: "Failed to delete role. Please try again.",
      variant: "destructive"
    })
    } finally {
      setDeletingRole({ ...deletingRole, [roleId]: false })
    }
  }

  const updateRoleName = async (roleId: string) => {
    if (!editRoleName.trim()) return

    const role = roles.find(r => r._id === roleId)
    if (!role) return

    try {
      setUpdatingRole({ ...updatingRole, [roleId]: true })
      
      const response = await fetch(`http://localhost:3000/api/candidate-role-skills/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: editRoleName.trim(),
          skills: role.skills
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to update role: ${response.status}`)
      }

      const result = await response.json()
      const updatedRole = result.data || result
      
      setRoles(roles.map(role => 
        role._id === roleId ? updatedRole : role
      ))
      setEditingRole(null)
      setEditRoleName("")
      toast({
        title: "Role updated",
        description: "Role name has been updated successfully."
      })
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdatingRole({ ...updatingRole, [roleId]: false })
    }
  }

  const addSkill = async (roleId: string) => {
    const skillName = newSkills[roleId]?.trim()
    if (!skillName) return

    const role = roles.find(r => r._id === roleId)
    if (!role) return

    try {
      setUpdatingSkills({ ...updatingSkills, [roleId]: true })
      
      // Create new skills array with the new skill
      const updatedSkills = [...role.skills, skillName]
      
      const response = await fetch(`http://localhost:3000/api/candidate-role-skills/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: updatedSkills
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to add skill: ${response.status}`)
      }

      const result = await response.json()
      const updatedRole = result.data || result
      setRoles(roles.map(role =>
        role._id === roleId ? updatedRole : role
      ))
      setNewSkills({ ...newSkills, [roleId]: "" })
      toast({
        title: "Skill added",
        description: `${skillName} has been added to the role.`
      })
    } catch (error) {
      console.error('Error adding skill:', error)
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdatingSkills({ ...updatingSkills, [roleId]: false })
    }
  }

  const removeSkill = async (roleId: string, skillName: string) => {
    const role = roles.find(r => r._id === roleId)
    if (!role) return

    try {
      setUpdatingSkills({ ...updatingSkills, [roleId]: true })
      
      // Remove the skill from the skills array
      const updatedSkills = role.skills.filter(skill => skill !== skillName)
      
      const response = await fetch(`http://localhost:3000/api/candidate-role-skills/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: updatedSkills
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to remove skill: ${response.status}`)
      }

      const result = await response.json()
      const updatedRole = result.data || result
    setRoles(roles.map(role =>
        role._id === roleId ? updatedRole : role
      ))
      toast({
        title: "Skill removed",
        description: `${skillName} has been removed from the role.`
      })
    } catch (error) {
      console.error('Error removing skill:', error)
      toast({
        title: "Error",
        description: "Failed to remove skill. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdatingSkills({ ...updatingSkills, [roleId]: false })
    }
  }

  try {
    if (loading) {
      return (
        <Layout title="Roles & Skills Management">
          <div className="w-full px-8 space-y-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading roles...</p>
              </div>
            </div>
          </div>
        </Layout>
      )
    }

    if (error) {
      return (
        <Layout title="Roles & Skills Management">
          <div className="w-full px-8 space-y-6">
            <Card className="interview-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={fetchRoles} className="interview-button-primary">
                      Try Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Layout>
      )
  }

  return (
    <Layout 
      title="Roles & Skills Management"
      action={
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {roles.length} role{roles.length !== 1 ? 's' : ''}
          </span>
        </div>
      }
    >
      <div className="w-full px-8 space-y-6">
        {/* Add New Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter role name (e.g., Frontend Developer)"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRole()}
                className="flex-1"
                  disabled={addingRole}
              />
              <Button 
                onClick={addRole}
                  disabled={!newRoleName.trim() || addingRole}
                className="interview-button-primary"
              >
                  {addingRole ? "Adding..." : "Add Role"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Roles List */}
        <div className="space-y-4">
          {roles.map((role) => (
              <Card key={role._id} className="interview-card">
              <CardContent className="pt-6">
                {/* Role Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                      {editingRole === role._id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editRoleName}
                          onChange={(e) => setEditRoleName(e.target.value)}
                          onKeyPress={(e) => {
                              if (e.key === 'Enter') updateRoleName(role._id)
                            if (e.key === 'Escape') {
                              setEditingRole(null)
                              setEditRoleName("")
                            }
                          }}
                          className="text-lg font-semibold"
                        />
                        <Button
                          size="sm"
                            onClick={() => updateRoleName(role._id)}
                          className="interview-button-primary"
                            disabled={updatingRole[role._id]}
                        >
                            {updatingRole[role._id] ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingRole(null)
                            setEditRoleName("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <h3 className="text-lg font-semibold text-foreground">
                          {role.role}
                      </h3>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                          setEditingRole(role._id)
                          setEditRoleName(role.role)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                        onClick={() => deleteRole(role._id)}
                        disabled={deletingRole[role._id]}
                    >
                        {deletingRole[role._id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                      <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Skills</h4>
                  
                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-2">
                      {role.skills.map((skill, index) => (
                      <Badge 
                          key={`${role._id}-${skill}-${index}`} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                          {skill}
                        <button
                            onClick={() => removeSkill(role._id, skill)}
                          className="ml-1 hover:text-destructive"
                            disabled={updatingSkills[role._id]}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Add Skill Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill (e.g., React, Python)"
                        value={newSkills[role._id] || ""}
                      onChange={(e) => setNewSkills({
                        ...newSkills,
                          [role._id]: e.target.value
                      })}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill(role._id)}
                      className="flex-1"
                        disabled={updatingSkills[role._id]}
                    />
                    <Button
                      size="sm"
                        onClick={() => addSkill(role._id)}
                        disabled={!newSkills[role._id]?.trim() || updatingSkills[role._id]}
                      className="interview-button-secondary"
                    >
                        {updatingSkills[role._id] ? "Adding..." : "Add Skill"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {roles.length === 0 && (
          <Card className="interview-card text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No roles created yet</h3>
              <p className="text-muted-foreground">
                Add your first role to start building your interview question database.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
  } catch (error) {
    console.error('Error rendering RolesSkills component:', error)
    return (
      <Layout title="Roles & Skills Management">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="interview-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                  <p className="text-muted-foreground mb-4">
                    An unexpected error occurred. Please refresh the page.
                  </p>
                  <Button onClick={() => window.location.reload()} className="interview-button-primary">
                    Refresh Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }
}