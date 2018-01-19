package ca.bc.gov.databc.smk.model;

import org.primefaces.model.DefaultTreeNode;
import org.primefaces.model.TreeNode;

public class RelationalTreeNode extends DefaultTreeNode
{
	private static final long serialVersionUID = 5383467519644010930L;

	private TreeNode originalParent;
	
	public RelationalTreeNode(Object data, TreeNode parent)
	{
		super(data, parent);
		
		originalParent = parent;
	}

	public TreeNode getOriginalParent() 
	{
		return originalParent;
	}

	public void setOriginalParent(TreeNode originalParent)
	{
		this.originalParent = originalParent;
	}
}
