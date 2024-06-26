import React, { Component } from 'react';
import axios from 'axios';
import Searchbar from './Searchbar';
import { Button } from 'react-bootstrap';
// import Table from './Table';
import { useTable, useResizeColumns } from 'react-table';
import Modal from './modal/Modal';
import { Navigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;
const apiPage = axios.create({
  baseURL: apiUrl,
});

class InformationTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm: '',
            showModal: false,
            rowData: null,
            showUpdate: true,
            changeData:false,
            user:false,
            enableEdit:true
        };
    }

    getWithExpiry(key) {
      const itemStr = localStorage.getItem(key)
      // Nếu không tồn tại, hoặc đã hết hạn, trả về null
      if (!itemStr) {
          return null
      }
      try{
        const item = JSON.parse(itemStr)
        const now = new Date()
        // Kiểm tra xem thời gian hết hạn đã đến chưa
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key)
            return null
        }
        return item.value
      }
      catch {
        return null
      }
      
  }
    componentDidMount(){
      // let token = localStorage.getItem("token");
      let token = this.getWithExpiry("token");
      let name = this.getWithExpiry("name");
      let role = this.getWithExpiry("role");
      if (token) {
      
          this.setState({ user: true });
      }
    }

    handleSearchbarValue = (value) => {
        // Xử lý giá trị state ở đây
        console.log('Searchbar value:', value);
        // this.setState({ searchTerm: value });
    }
    handleSearchTerm = (value) => {
        this.setState({ searchTerm: value });
    }
    toggleChangeData = () => {
      console.log("change");
      this.setState(prevState => ({ 
        changeData: !prevState.changeData
      }));
      // console.log(rowData);
    }

    toggleModal = (rowData) => {
      if(this.props.enableEdit){
        this.setState(prevState => ({ 
          showModal: !prevState.showModal ,
          rowData: rowData
        }));
      }
      
      // console.log(rowData);
    }
    fetchData = async () => {
      try {
          // const url = apiUrl + this.props.api;
          // if(this.props.api.includes("Computer") || this.props.api.includes("Printers")){
          //   await apiPage.get(this.props.api+"/UpdateIpStatus");
          // }
          const response = await apiPage.get(this.props.api); 
          const responseData = response.data;
          const newData = responseData.map((item, index) => ({ ...item, number: index + 1 }));
          return newData;
      } catch (error) {
          console.error('Error fetching data:', error);
          return [];
      }
  }

    render() {
      const { showModal,rowData,user  } = this.state;
      const {enableEdit} = this.props;
        return (
            <div>
                <div className="card border-primary">
                {/* {user && (<Navigate to="/home" replace={true} />)} */}
                    <div className="card-body">
                        <h4 className="card-title">
                            <div className='me-md-2 navbar'>
                            <div>
                                <i className="fa-solid fa-table" style={{ marginRight: '10px' }}></i> 
                                {this.props.title}
                                {enableEdit && (<Button 
                                variant="primary" 
                                className={`btn-show-modal ${this.props.btnAdd}`} 
                                style={{ marginLeft: '20px' }}
                                onClick={this.toggleModal} >
                                  Add
                                </Button>)}
                                
                                </div>
                                <Searchbar 
                                btnID = {this.props.SearchbarId} 
                                label = {this.props.SearchbarLavel} 
                                handleSearchbarValue={this.handleSearchTerm}
                                />
                            </div>
                        </h4>
                        <DataTable 
                        api = {this.props.api} 
                        columns = {this.props.columns} 
                        searchTerm={this.state.searchTerm}
                        toggleModal={this.toggleModal}
                        fetchData={this.fetchData}
                        changeData={this.state.changeData}
                        />
                    </div>
                </div>
                <br></br>
                <Modal 
                api = {this.props.api} 
                columns={this.props.columns}
                title={this.props.changeTitle}
                showModal={showModal}
                toggleModal={this.toggleModal}
                defaultValue={rowData}
                fetchData={this.fetchData}
                toggleChangeData={this.toggleChangeData}
                // defaultValue={rowData ? rowData[this.props.columns[0].accessor] : null}
                />
            </div>
        );
    }
}

export default InformationTable;

class DataTable extends Component {
    constructor(props) {
      super(props);
      this.state = {
        changeData: false,
        data: []
      };
    }
  
    componentDidMount() {
      this.fetchData();
    }
    
    componentDidUpdate(prevProps,prevState) {
      if (prevProps.searchTerm !== this.props.searchTerm) {
        this.fetchData();
      }
      if (prevProps.changeData !== this.props.changeData) {
        this.fetchData();
      }
    }
    
    fetchData = async () => {
      const newData = await this.props.fetchData(); // Gọi hàm fetchData từ props
      this.setState({ data: newData });
    }
  
    // fetchData = async () => {
    //   try {
    //     const url = apiUrl + this.props.api;
    //     console.log(url);
    //     const response = await apiPage.get(this.props.api); 
    //     const responseData = response.data;
    //     const newData = responseData.map((item, index) => ({ ...item, number: index + 1 }));
    //     this.setState({ data: newData });
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   }
    // }

    filterData = () => {
        const { data } = this.state;
        const { searchTerm } = this.props;
        if (!searchTerm) {
            return data;
        }
        return data.filter(item => {
            // Thực hiện lọc dữ liệu dựa trên giá trị searchTerm
            return Object.values(item).some(value => {
                return String(value).toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    }
    
  
    render() {
      const columns = this.props.columns;
      const filteredData = this.filterData();
  
    //   const { data } = this.state;
  
      return (
        <div className="table-data-container">
          <Table 
          columns={columns} 
          data={filteredData}
          // rowData={this.props.rowData} 
          toggleModal={this.props.toggleModal} />
        </div>
      );
    }
  }

  
const Table = ({ columns, data ,toggleModal}) => {
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable(
      { columns, data },
      useResizeColumns 
    );

    const handleRowDoubleClick = rowData => {
      toggleModal(rowData); 
      // console.log(rowData);
    };
  
    return (
      <div className='table-container'>
        <table className='table' {...getTableProps()}>
            <thead className='table-header'>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()} style={{ width: column.width }}>{column.render('Header')}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} onDoubleClick={() => handleRowDoubleClick(row.original)}>
                    {row.cells.map(cell => (
                      <td 
                        {...cell.getCellProps()}>
                          {/* {console.log(cell.row.original.isConnect)} */}
                        {cell.column.Header === 'IP' ?(
                          <div className='view-connected'>
                              <div className='row'>
                                <div className='col-8'>
                                  {cell.value}
                                </div>

                                <div className='col-4 circle-container'>
                                  {cell.row.original.isConnect? 
                                      (cell.row.original.isConnect === "true"?(
                                        <div className="circle-view circle-blue">
                                          <div className='circle-status circle-status-on'>online</div>
                                        </div>
                                     
                                    ):(
                                      <div className="circle-view circle-red">
                                        <div className='circle-status circle-status-off'>offline</div>
                                      </div>
                                    ))
                                  :(
                                    <div className="circle-view circle-red"></div>
                                  )}
                                  {/* <div className='row'>
                                    <div className="circle-view circle-blue"></div>
                                    <div className="circle-view circle-red"></div>
                                  </div> */}
                                </div>
                              </div>
                          </div>
                                )
                                 : cell.column.Header === 'History' ?(
                                  <div>
                                     <div dangerouslySetInnerHTML={{ __html: cell.value }} />
                                  </div>
                                 ):( cell.render('Cell') )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
      </div>
      
    );
  };